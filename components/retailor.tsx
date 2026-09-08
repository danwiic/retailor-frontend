"use client";

import { useEffect, useRef, useState } from "react";
import {
  analyzeJd,
  ApiTimeoutError,
  asResult,
  parseResume,
  readUsage,
  tailor,
  type Result,
} from "@/lib/api";
import {
  buildDocument,
  extractTailoredText,
  type DocLine,
  type TrimmedLine,
} from "@/lib/annotate";
import { SAMPLE_JD, SAMPLE_RESUME, SAMPLE_TAILORED } from "@/lib/sample";
import { DocumentView } from "./annotated-document";
import { BusyPaper, ErrorPaper, IdlePaper } from "./paper-states";
import { FormBand, type ResumeState } from "./form-band";
import { Proof } from "./proof";
import { Wordmark } from "./wordmark";

const USED_KEY = "retailor.used";
const USED_LIMIT = 3;

type Phase = "idle" | "parsing" | "running" | "done" | "error";
type RunKind = "parse" | "tailor";

interface Doc {
  lines: DocLine[];
  trimmed: TrimmedLine[];
  plainText: string;
}

function pickIdentity(parsed: unknown): Pick<ResumeState, "name" | "headline"> {
  if (parsed == null || typeof parsed !== "object") return {};
  const j = parsed as Record<string, unknown>;
  const name = typeof j.name === "string" ? j.name : undefined;
  const headline =
    (typeof j.headline === "string" && j.headline) ||
    (typeof j.title === "string" ? j.title : undefined) ||
    (typeof j.role === "string" ? j.role : undefined);
  return { name, headline };
}

function readUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const n = Number(window.localStorage.getItem(USED_KEY) ?? "0");
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeUsed(n: number) {
  try {
    window.localStorage.setItem(USED_KEY, String(n));
  } catch {
    /* non-persistent session */
  }
}

export function Retailor() {
  const [resume, setResume] = useState<ResumeState | null>(null);
  const [parsedResume, setParsedResume] = useState<unknown>(null);
  const [jd, setJd] = useState("");
  const [jdResult, setJdResult] = useState<unknown | null>(null);
  const [jdRead, setJdRead] = useState<"idle" | "done" | "failed">("idle");
  const [doc, setDoc] = useState<Doc | null>(null);
  const [sampleDoc, setSampleDoc] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const [used, setUsed] = useState<number>(0);
  const [usedEcho, setUsedEcho] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<RunKind>("tailor");
  const [exhausted, setExhausted] = useState(false);

  const analyzeToken = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const phaseBeforeRun = useRef<Phase>("idle");
  const paperBoxRef = useRef<HTMLDivElement | null>(null);
  const prevPhase = useRef<Phase>("idle");

  /* ── sync the stored usage count after hydration (client-only) ── */
  // Legacy demo surface retained for reference; the workflow surface owns this state now.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setUsed(readUsed());
  }, []);

  const busy = phase === "parsing" || phase === "running";
  const busyLabel = phase === "parsing" ? "Reading your resume…" : "Tailoring to the posting…";
  const limitReached = used >= USED_LIMIT;
  const canTailor =
    resume !== null &&
    parsedResume !== null &&
    jd.trim().length >= 30 &&
    !busy &&
    !limitReached;

  const jdText = jd.trim();
  const jdStatus: "empty" | "typing" | "read" | "failed" =
    jdText.length < 40
      ? "empty"
      : jdRead === "done"
        ? "read"
        : jdRead === "failed"
          ? "failed"
          : "typing";

  /* ── auto-read the posting while the user pastes ── */
  useEffect(() => {
    const text = jd.trim();
    if (text.length < 40) return;
    const token = ++analyzeToken.current;
    const timer = setTimeout(async () => {
      try {
        const { data, status } = await analyzeJd(text);
        if (token !== analyzeToken.current) return;
        const res = asResult(data, status, "Couldn't read the posting");
        if (res.ok) {
          setJdRead("done");
          setJdResult(res.value);
        } else {
          setJdRead("failed");
          setJdResult(null);
        }
      } catch {
        if (token !== analyzeToken.current) return;
        setJdRead("failed");
        setJdResult(null);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [jd]);

  function handleJdChange(text: string) {
    setJd(text);
    setJdResult(null);
    setJdRead("idle");
  }

  function cancelRun() {
    abortRef.current?.abort();
  }

  /* ── upload → parse ── */
  async function handleResumeFile(file: File) {
    cancelRun();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    lastFileRef.current = file;
    phaseBeforeRun.current = phase;
    setLastAction("parse");
    setPhase("parsing");
    setError(null);
    setExhausted(false);
    try {
      const { data, status } = await parseResume(file, { signal: ctrl.signal });
      const res = asResult(
        data,
        status,
        "Retailor couldn't read that file. Try a PDF or DOCX."
      );
      if (!res.ok) {
        setResume(null);
        setParsedResume(null);
        setPhase("error");
        setError({ title: "Couldn't read your resume", detail: res.detail });
        return;
      }
      setParsedResume(res.value);
      setResume({ file, ...pickIdentity(res.value) });
      setDoc(null);
      setSampleDoc(false);
      setPhase("idle");
    } catch (err) {
      if (ctrl.signal.aborted) {
        setResume(null);
        setParsedResume(null);
        setDoc(null);
        setSampleDoc(false);
        setPhase("idle");
        return;
      }
      const title = "Couldn't reach the resume reader";
      const detail =
        err instanceof ApiTimeoutError
          ? "The file was taking too long to read. Check the connection and try again."
          : "The Retailor service isn't responding right now. Make sure it's running, then try again.";
      setResume(null);
      setParsedResume(null);
      setPhase("error");
      setError({ title, detail });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  }

  /* ── tailor ── */
  async function handleTailor() {
    if (resume === null || parsedResume === null || limitReached) return;
    cancelRun();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    phaseBeforeRun.current = phase;
    setLastAction("tailor");
    setPhase("running");
    setError(null);
    setExhausted(false);
    const payloadJd = (jdResult as Record<string, unknown> | null) ?? { text: jd };
    try {
      const { data, status } = await tailor(parsedResume, payloadJd, 'docx', {
        signal: ctrl.signal,
      });
      const res: Result<unknown> = asResult(
        data,
        status,
        "Tailoring didn't finish cleanly."
      );

      if (!res.ok) {
        const detail = String(res.detail ?? "").toLowerCase();
        const isExhausted =
          res.status === 402 ||
          res.status === 403 ||
          detail.includes("limit") ||
          detail.includes("free usage") ||
          detail.includes("exhausted");
        if (isExhausted) {
          setUsed(USED_LIMIT);
          writeUsed(USED_LIMIT);
          setExhausted(true);
          setPhase("error");
          setError({
            title: "You've used the free allowance for this browser",
            detail:
              "That's the three free tailorings, counted the way the service counts them. Open a different browser or device to start a fresh allowance.",
          });
        } else {
          setPhase("error");
          setError({
            title: "The tailoring service didn't respond",
            detail: res.detail,
          });
        }
        return;
      }

      const text = extractTailoredText(res.value);
      if (!text) {
        setPhase("error");
        setError({
          title: "Nothing to show",
          detail:
            "The service came back with an empty result. Try the tailoring again.",
        });
        return;
      }

      const built = buildDocument(text, parsedResume, jd);
      setDoc({ lines: built.lines, trimmed: built.trimmed, plainText: text });
      setSampleDoc(false);
      setPhase("done");
      const n = readUsed() + 1;
      setUsed(Math.min(n, USED_LIMIT));
      writeUsed(Math.min(n, USED_LIMIT));
      setUsedEcho(readUsage(res.value));
    } catch (err) {
      if (ctrl.signal.aborted) {
        setPhase(phaseBeforeRun.current === "done" && doc ? "done" : "idle");
        return;
      }
      const title = "Tailoring didn't finish";
      const detail =
        err instanceof ApiTimeoutError
          ? "It took too long to get a result. Check the connection and try again."
          : "The Retailor service isn't responding right now. Make sure it's running, then try again.";
      setPhase("error");
      setError({ title, detail });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  }

  function retry() {
    if (lastAction === "parse") {
      const file = lastFileRef.current;
      if (file) void handleResumeFile(file);
      else setPhase("idle");
    } else {
      void handleTailor();
    }
  }

  function handleSample() {
    cancelRun();
    setLastAction("tailor");
    setError(null);
    setExhausted(false);
    const built = buildDocument(SAMPLE_TAILORED, SAMPLE_RESUME, SAMPLE_JD);
    setDoc({ lines: built.lines, trimmed: built.trimmed, plainText: SAMPLE_TAILORED });
    setSampleDoc(true);
    setPhase("done");
  }

  /* ── announce transitions and move focus to the result ── */
  useEffect(() => {
    if (phase === prevPhase.current) return;
    prevPhase.current = phase;
    if (phase === "done" || phase === "error") {
      const node = paperBoxRef.current;
      const target = node?.querySelector<HTMLElement>(".paper-focus");
      target?.focus({ preventScroll: true });
    }
  }, [phase]);

  const shownUsed = usedEcho ?? used;

  const liveStatus =
    phase === "parsing"
      ? "Reading your resume."
      : phase === "running"
        ? "Tailoring your resume to the posting."
        : phase === "done"
          ? sampleDoc
            ? "Here's a synthetic sample, with every change marked."
            : "Here is your tailored resume, with every change marked."
          : phase === "error"
            ? error?.title ?? "Something went wrong."
            : "";

  let paperSlot: React.ReactNode;
  if (phase === "done" && doc) {
    paperSlot = (
      <DocumentView
        lines={doc.lines}
        trimmed={doc.trimmed}
        plainText={doc.plainText}
        sample={sampleDoc}
      />
    );
  } else if (phase === "error" && error) {
    paperSlot = (
      <ErrorPaper
        title={error.title}
        detail={error.detail}
        onRetry={exhausted ? undefined : retry}
      />
    );
  } else if (phase === "parsing") {
    paperSlot = (
      <BusyPaper
        title="Reading your resume…"
        detail="Retailor is pulling out your experience to work from. Just a moment."
        onCancel={cancelRun}
      />
    );
  } else if (phase === "running") {
    paperSlot = (
      <BusyPaper
        title="Tailoring to the posting…"
        detail="Re-framing each item against the posting you pasted. This usually takes under a minute."
        onCancel={cancelRun}
      />
    );
  } else {
    paperSlot = <IdlePaper onSample={handleSample} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-[var(--r-ink-band)] text-[var(--r-on-ink)]">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
          <Wordmark inverse />
          <nav aria-label="Primary">
            <a
              href="#how"
              className="mr-5 hidden text-sm font-medium text-[var(--r-on-ink-2)] hover:text-[var(--r-on-ink)] sm:inline"
            >
              How it works
            </a>
            <span className="usage usage--ink" title="Free allowance for this browser">
              <span aria-hidden className="usage__dots">
                {Array.from({ length: USED_LIMIT }, (_, i) => (
                  <span
                    key={i}
                    className={`usage__dot ${i < shownUsed ? "usage__dot--on" : ""}`}
                  />
                ))}
              </span>
              <span className="mono-num">
                <span className="sr-only">Free tailorings used this browser: </span>
                {shownUsed} of {USED_LIMIT}
              </span>
            </span>
          </nav>
        </header>

        {/* ── Lead ── */}
        <section className="hero-enter mx-auto w-full max-w-5xl px-6 pt-2 pb-14 md:pt-4 md:pb-20">
          <h1 className="font-display max-w-[24ch] text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.03em] text-[var(--r-on-ink)] md:text-[3.5rem]">
            Your resume, cut to fit the exact job.
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.0625rem] leading-8 text-[var(--r-on-ink-2)]">
            Paste the posting, bring your resume, and get a version re-framed
            to the opening you’re actually applying to — ATS-safe, honest to
            what you’ve done, with every change marked.
          </p>
        </section>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16">
        {/* ── The mechanism ── */}
        <section aria-label="Tailor your resume" className="pt-10 md:pt-14">
          <div className="form-enter">
            <FormBand
              resume={resume}
              jd={jd}
              jdStatus={jdStatus}
              busy={busy}
              busyLabel={busy ? busyLabel : null}
              canTailor={canTailor}
              limitReached={limitReached}
              onResumeFile={(f) => void handleResumeFile(f)}
              onClearResume={() => {
                cancelRun();
                setResume(null);
                setParsedResume(null);
                setDoc(null);
                setSampleDoc(false);
                setPhase("idle");
              }}
              onJdChange={handleJdChange}
              onSampleJd={() => handleJdChange(SAMPLE_JD)}
              onTailor={() => void handleTailor()}
            />
          </div>

          <div className="mt-10">
            <p className="sr-only" aria-live="polite">
              {liveStatus}
            </p>
            <div ref={paperBoxRef} aria-busy={busy}>
              {paperSlot}
            </div>
          </div>

          {/* ── Trust strip ── */}
          <div className="mt-10 grid border-t border-[var(--r-border)] md:grid-cols-3 md:divide-x md:divide-[var(--r-border)]">
            <div className="border-b border-[var(--r-border)] py-5 md:border-b-0 md:py-6 md:pr-6">
              <p className="text-sm font-semibold text-[var(--r-ink)]">
                Reads the exact posting
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--r-ink-2)]">
                The job you paste is the only input that matters — no generic
                keyword guessing.
              </p>
            </div>
            <div className="border-b border-[var(--r-border)] py-5 md:border-b-0 md:px-6">
              <p className="text-sm font-semibold text-[var(--r-ink)]">
                Honest about you
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--r-ink-2)]">
                Real experience only. Nothing invented, padded, or claimed
                for you.
              </p>
            </div>
            <div className="py-5 md:py-6 md:pl-6">
              <p className="text-sm font-semibold text-[var(--r-ink)]">
                ATS-safe output
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--r-ink-2)]">
                Clean, structured plain text that parses cleanly through
                applicant tracking systems.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Proof />
    </div>
  );
}
