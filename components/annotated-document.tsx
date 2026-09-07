"use client";

import { useEffect, useRef, useState } from "react";
import type { DocLine, TrimmedLine } from "@/lib/annotate";
import { CheckIcon, CopyIcon, DownloadIcon } from "./icons";

/* ─────────────────────────── the paper ─────────────────────────── */

const CHIP_INFO: Record<
  "keyed" | "rephrased" | "trimmed",
  { label: string; tone: string; note: string }
> = {
  keyed: {
    label: "Matched",
    tone: "keyed",
    note: "Speaks directly to the posting.",
  },
  rephrased: {
    label: "Rephrased",
    tone: "rephrased",
    note: "Reworded from your original resume.",
  },
  trimmed: {
    label: "Left out",
    tone: "trimmed",
    note: "Left out of the tailored version.",
  },
};

function Gutter({ chip }: { chip: keyof typeof CHIP_INFO | null }) {
  return (
    <div className="flex items-start justify-end pr-1.5 pt-1" aria-hidden>
      {chip ? (
        <span className={`chip chip--${CHIP_INFO[chip].tone}`} title={CHIP_INFO[chip].note}>
          {CHIP_INFO[chip].label}
        </span>
      ) : null}
    </div>
  );
}

const LEGEND: { kind: "keyed" | "rephrased" | "trimmed"; dot: string; text: string }[] = [
  { kind: "keyed", dot: "bg-[var(--r-accent)]", text: "Matched — speaks to the posting" },
  { kind: "rephrased", dot: "bg-[var(--r-primary)]", text: "Rephrased — reworded from your resume" },
  { kind: "trimmed", dot: "bg-[var(--r-ink-3)]", text: "Left out — not in the tailored version" },
];

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-b border-[var(--r-border)] bg-[oklch(98.5%_0.003_250)] px-4 py-2.5 text-[0.6875rem] text-[var(--r-ink-2)] md:pl-6">
      {LEGEND.map(({ dot, text }) => (
        <span key={text} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-[5px] w-[5px] flex-none rounded-full ${dot}`} />
          {text}
        </span>
      ))}
    </div>
  );
}

function Body({
  kind,
  text,
  srNote,
}: {
  kind: DocLine["kind"];
  text: string;
  srNote?: string;
}) {
  switch (kind) {
    case "name":
      return <p className="doc__name">{text}</p>;
    case "meta":
      return <p className="doc__meta">{text}</p>;
    case "summary":
      return <p className="doc__b">{text}</p>;
    case "heading":
      return <h2 className="doc__h">{text}</h2>;
    default:
      return (
        <div className="doc__row">
          <span className="doc__tick" aria-hidden />
          <span className="doc__line">{text}</span>
          {srNote ? <span className="sr-only"> {srNote}</span> : null}
        </div>
      );
  }
}

export function DocumentView({
  lines,
  trimmed,
  plainText,
  sample = false,
}: {
  lines: DocLine[];
  trimmed: TrimmedLine[];
  plainText: string;
  sample?: boolean;
}) {
  const rows = lines.map((line, i) => {
    const annotated = line.kind === "keyed" || line.kind === "rephrased";
    const chip = annotated ? (line.kind as "keyed" | "rephrased") : null;
    const note = chip ? CHIP_INFO[chip].note : undefined;
    const isFirst = i === 0;

    return (
      <div
        key={i}
        className="doc-print grid grid-cols-[5.25rem_1fr]"
        style={{ animationDelay: `${Math.min(i, 12) * 24}ms` }}
      >
        <div className="border-r border-[var(--r-border)] bg-[oklch(98.3%_0.003_250)] py-1 pr-1.5">
          <Gutter chip={chip} />
        </div>
        <div className={`min-w-0 px-4 py-1 md:pl-6 ${isFirst ? "pt-6" : ""}`}>
          <Body kind={line.kind} text={line.text} srNote={note} />
        </div>
      </div>
    );
  });

  const trimmedRows =
    trimmed.length > 0
      ? trimmed.map((t, i) => (
          <div
            key={`trim-${i}`}
            className="doc-print grid grid-cols-[5.25rem_1fr]"
            style={{ animationDelay: `${Math.min(lines.length + i, 12) * 24}ms` }}
          >
            <div className="border-r border-[var(--r-border)] bg-[oklch(98.3%_0.003_250)] py-1 pr-1.5">
              <Gutter chip="trimmed" />
            </div>
            <div className="min-w-0 px-4 py-1 md:pl-6">
              <div className="doc__row">
                <span className="doc__tick" aria-hidden />
                <span className="doc__line text-[var(--r-ink-3)] line-through opacity-70">
                  {t.text}
                </span>
                <span className="sr-only"> {CHIP_INFO.trimmed.note}</span>
              </div>
            </div>
          </div>
        ))
      : null;

  const hasAnnotations =
    lines.some((l) => l.kind === "keyed" || l.kind === "rephrased") ||
    trimmed.length > 0;

  return (
    <section
      className="paper-focus overflow-hidden rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] shadow-[var(--r-shadow-2)]"
      aria-label={sample ? "Synthetic sample of a tailored resume" : "Tailored resume"}
      tabIndex={-1}
    >
      <div className="grid grid-cols-[5.25rem_1fr] border-b border-[var(--r-border)]">
        <div className="hidden items-center justify-center sm:flex" aria-hidden>
          <span className="font-display text-[0.6875rem] font-semibold tracking-[0.1em] text-[var(--r-ink-3)] uppercase [writing-mode:vertical-rl]">
            Retailor
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:pl-6">
          <p className="text-xs text-[var(--r-ink-2)]">
            <CheckIcon
              className="-mt-0.5 mr-1 inline text-[var(--r-accent-ink)]"
              width={14}
              height={14}
            />
            {sample
              ? "Synthetic example — how Retailor marks changes"
              : "Tailored to the posting you pasted"}
          </p>
          <div className="flex items-center gap-1">
            <CopyButton text={plainText} />
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => downloadText(plainText, "tailored-resume.txt")}
            >
              <DownloadIcon width={14} height={14} /> Plain text
            </button>
          </div>
        </div>
      </div>

      {hasAnnotations ? <Legend /> : null}

      <div className="overflow-x-auto">
        {rows}
        {trimmedRows ? (
          <>
            <div className="grid grid-cols-[5.25rem_1fr] border-t border-[var(--r-border)]">
              <div className="border-r border-[var(--r-border)] bg-[oklch(98.3%_0.003_250)]" />
              <div className="min-w-0 px-4 pt-4 pb-1 md:pl-6">
                <p className="text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-[var(--r-ink-3)]">
                  Left out of the tailored version
                </p>
              </div>
            </div>
            {trimmedRows}
          </>
        ) : null}
      </div>
    </section>
  );
}

/* ─────────────────────────── copy / download ─────────────────────────── */

async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    const ok = await writeClipboard(text);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      <button type="button" className="btn btn--quiet" onClick={() => void onCopy()}>
        {state === "copied" ? (
          <>
            <CheckIcon width={14} height={14} /> Copied
          </>
        ) : (
          <>
            <CopyIcon width={14} height={14} /> Copy
          </>
        )}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied"
          ? "Copied to clipboard."
          : state === "failed"
            ? "Couldn't copy automatically. Select the text and copy it manually."
            : ""}
      </span>
    </>
  );
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
