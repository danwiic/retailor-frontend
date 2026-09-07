"use client";

import { CloseIcon, RefreshIcon } from "./icons";

/* ─────────────────────── idle / busy / error ─────────────────────── */

export function IdlePaper({ onSample }: { onSample: () => void }) {
  return (
    <section
      className="overflow-hidden rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] shadow-[var(--r-shadow-2)]"
      aria-label="Your tailored resume will appear here"
    >
      <div className="paper__state">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--r-ink)]">
            Your tailored resume lands here.
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--r-ink-2)]">
            Everything Retailor changes is marked at the left edge, so you can
            read it like a reviewer — not trust it on faith.
          </p>
        </div>

        <div className="steps">
          <div className="step">
            <p className="step__k">Bring your resume</p>
            <p className="step__d">
              PDF or DOCX. Retailor reads it as-is; you keep ownership of it.
            </p>
            <p className="step__tag">Then</p>
          </div>
          <div className="step">
            <p className="step__k">Paste the whole posting</p>
            <p className="step__d">
              The exact job you’re applying to — every requirement and
              responsibility.
            </p>
            <p className="step__tag">Then</p>
          </div>
          <div className="step">
            <p className="step__k">Tailor</p>
            <p className="step__d">
              It comes back re-framed to the posting, honest to what you’ve
              actually done.
            </p>
          </div>
        </div>

        <button type="button" className="btn btn--ghost" onClick={onSample}>
          See a sample result
        </button>
        <p className="-mt-3 text-xs text-[var(--r-ink-3)]">
          A synthetic example — not your resume. Shows how Retailor marks
          changes.
        </p>
      </div>
    </section>
  );
}

export function BusyPaper({
  title,
  detail,
  onCancel,
}: {
  title: string;
  detail: string;
  onCancel?: () => void;
}) {
  return (
    <section
      className="overflow-hidden rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] shadow-[var(--r-shadow-2)]"
      aria-busy="true"
      aria-label={title}
    >
      <div className="paper__state">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--r-ink)]">
          {title}
        </h2>
        <p className="-mt-3 text-sm leading-6 text-[var(--r-ink-2)]">
          {detail}
        </p>

        <div className="w-full max-w-[38rem] space-y-3" aria-hidden>
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-3.5 w-72" />
          <div className="skeleton h-3.5 w-80" />
          <div className="skeleton h-3.5 w-64" />
          <div className="pt-3" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-[92%]" />
          <div className="skeleton h-3.5 w-[86%]" />
          <div className="skeleton h-3.5 w-[95%]" />
        </div>

        {onCancel ? (
          <button type="button" className="btn btn--quiet" onClick={onCancel}>
            <CloseIcon width={12} height={12} /> Cancel
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function ErrorPaper({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <section
      className="paper-focus overflow-hidden rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] shadow-[var(--r-shadow-2)]"
      aria-label="Something went wrong"
      tabIndex={-1}
    >
      <div className="paper__state">
        <div className="banner banner--error">
          <span className="mt-0.5">
            <RefreshIcon width={15} height={15} />
          </span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-0.5">{detail}</p>
          </div>
        </div>
        {onRetry ? (
          <button type="button" className="btn btn--ghost" onClick={onRetry}>
            <RefreshIcon width={15} height={15} /> Try again
          </button>
        ) : null}
      </div>
    </section>
  );
}
