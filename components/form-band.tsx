"use client";

import { useState, type DragEvent, type ChangeEvent, type KeyboardEvent } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  FileIcon,
  PasteIcon,
  UploadIcon,
} from "./icons";

export interface ResumeState {
  file: File;
  name?: string;
  headline?: string;
}

export function FormBand({
  resume,
  jd,
  jdStatus,
  busy,
  busyLabel,
  canTailor,
  limitReached,
  onResumeFile,
  onClearResume,
  onJdChange,
  onSampleJd,
  onTailor,
}: {
  resume: ResumeState | null;
  jd: string;
  jdStatus: "empty" | "typing" | "read" | "failed";
  busy: boolean;
  busyLabel: string | null;
  canTailor: boolean;
  limitReached: boolean;
  onResumeFile: (file: File) => void;
  onClearResume: () => void;
  onJdChange: (text: string) => void;
  onSampleJd: () => void;
  onTailor: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onResumeFile(file);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onResumeFile(file);
    e.target.value = "";
  }

  function onJdKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!busy && canTailor) onTailor();
    }
  }

  const jdTrimmed = jd.trim();
  let help: string;
  if (busy && busyLabel) {
    help = busyLabel;
  } else if (limitReached) {
    help =
      "You've used this browser's three free tailorings. A fresh allowance starts in a new browser or device.";
  } else if (!resume) {
    help = "Upload your resume to continue.";
  } else if (jdTrimmed.length === 0) {
    help = "Paste the job description to continue.";
  } else if (jdTrimmed.length < 30) {
    help = "Keep pasting the posting — Retailor reads the exact text you give it.";
  } else {
    help =
      "Retailor re-frames your resume to the posting — and marks every change at the left edge of the result.";
  }

  return (
    <div className="rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] p-5 shadow-[var(--r-shadow-1)] md:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        {/* ── Resume ── */}
        <div className="field">
          <div className="field__label-row">
            <span className="field__label">Your resume</span>
            <span className="field__note">PDF or DOCX</span>
          </div>

          {resume ? (
            <div className="dropzone is-filled">
              <div className="flex w-full flex-col gap-2.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--r-radius-sm)] bg-[oklch(96%_0.024_250)] text-[var(--r-primary-ink)]">
                    <FileIcon width={17} height={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--r-ink)]">
                      {resume.file.name}
                    </span>
                    <span className="block text-xs text-[var(--r-ink-3)]">
                      {resume.name ? `${resume.name} · ${resume.headline ?? ""}`.replace(/ · $/, "") : "Read — ready to tailor"}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn--quiet self-start"
                  onClick={onClearResume}
                >
                  <CloseIcon width={12} height={12} /> Replace
                </button>
              </div>
            </div>
          ) : (
            <label
              className={`dropzone ${dragging ? "is-dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onPick}
              />
              <span className="dropzone__body">
                <UploadIcon
                  className="mt-0.5 flex-none text-[var(--r-primary-ink)]"
                  width={19}
                  height={19}
                />
                <span className="dropzone__copy">
                  <span className="dropzone__title">Drop your resume here</span>
                  <span className="dropzone__meta">
                    or click to browse. Nothing leaves this page until you run
                    it.
                  </span>
                </span>
              </span>
            </label>
          )}
        </div>

        {/* ── Job description ── */}
        <div className="field">
          <div className="field__label-row">
            <label className="field__label" htmlFor="retailor-jd">
              Job description
            </label>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={onSampleJd}
            >
              <PasteIcon width={13} height={13} /> Use a sample posting
            </button>
          </div>
          <textarea
            id="retailor-jd"
            className="textarea"
            spellCheck={false}
            placeholder="Paste the whole posting — the exact job you're applying to."
            value={jd}
            onChange={(e) => onJdChange(e.target.value)}
            onKeyDown={onJdKeyDown}
          />
          <p
            className={`text-xs ${jdStatus === "read" ? "text-[var(--r-accent-ink)]" : "text-[var(--r-ink-3)]"}`}
            aria-live="polite"
          >
            {jdStatus === "empty" &&
              "Retailor reads the exact text you paste."}
            {jdStatus === "typing" && "Reading the posting as you paste…"}
            {jdStatus === "read" && (
              <>
                <CheckIcon
                  className="-mt-0.5 mr-1 inline"
                  width={13}
                  height={13}
                />
                Posting read — requirements and responsibilities identified.
              </>
            )}
            {jdStatus === "failed" &&
              "Posting read paused — tailoring will still work."}
          </p>
        </div>
      </div>

      {/* ── Action ── */}
      <div className="mt-6 flex flex-col items-start gap-3 border-t border-[var(--r-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[34ch] text-sm leading-6 text-[var(--r-ink-2)]">
          {help}
        </p>
        <button
          type="button"
          className="btn btn--primary w-full sm:w-auto"
          disabled={!canTailor || busy}
          onClick={onTailor}
        >
          {busy && busyLabel ? busyLabel : "Tailor my resume"}
          {!busy && <ArrowRightIcon width={15} height={15} />}
        </button>
      </div>
    </div>
  );
}
