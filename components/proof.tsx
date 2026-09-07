import { ScissorsIcon, ShieldIcon, RetuneIcon } from "./icons";
import { Wordmark } from "./wordmark";

export function Proof() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6">
      {/* ── How it works, in the result ── */}
      <section
        id="how"
        aria-labelledby="how-title"
        className="grid gap-10 border-t border-[var(--r-border)] py-16 md:grid-cols-[minmax(0,2fr)_3fr] md:gap-16 md:py-20"
      >
        <div className="md:sticky md:top-10 md:self-start">
          <h2
            id="how-title"
            className="font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--r-ink)] md:text-[1.875rem]"
          >
            How it works
          </h2>
          <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-7 text-[var(--r-ink-2)]">
            Paste the posting, bring your resume, and Retailor re-frames only
            what needs it — matching your real bullets to the job’s language
            and rewriting the rest. Every change comes back marked at the left
            edge, so the work is checkable, not magic.
          </p>
        </div>

        <ul className="border-t border-[var(--r-border)]">
          <li className="flex items-baseline gap-3 border-b border-[var(--r-border)] py-5">
            <ShieldIcon
              className="mt-1 flex-none text-[var(--r-accent-ink)]"
              width={17}
              height={17}
            />
            <p className="text-[0.9375rem] leading-7 text-[var(--r-ink-2)]">
              The result comes back as clean, structured plain text. ATS
              software reads text and gets lost in tables, image lettering,
              and columns — yours has none of that.
            </p>
          </li>
          <li className="flex items-baseline gap-3 border-b border-[var(--r-border)] py-5">
            <ScissorsIcon
              className="mt-1 flex-none text-[var(--r-accent-ink)]"
              width={17}
              height={17}
            />
            <p className="text-[0.9375rem] leading-7 text-[var(--r-ink-2)]">
              Nothing is written to game a parser — no hidden keyword
              stuffing. A human screener reads the same document the machine
              does.
            </p>
          </li>
          <li className="flex items-baseline gap-3 py-5">
            <RetuneIcon
              className="mt-1 flex-none text-[var(--r-accent-ink)]"
              width={17}
              height={17}
            />
            <p className="text-[0.9375rem] leading-7 text-[var(--r-ink-2)]">
              Your real experience stays yours. Nothing is invented, padded,
              or claimed for you.
            </p>
          </li>
        </ul>
      </section>

      {/* ── The free allowance ── */}
      <section className="border-t border-[var(--r-border)] py-16 md:py-20">
        <div className="rounded-[var(--r-radius-lg)] border border-[var(--r-border)] bg-[var(--r-surface)] p-8 shadow-[var(--r-shadow-1)] md:p-10">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-12">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-[var(--r-ink)]">
                Free, plainly.
              </h2>
              <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-7 text-[var(--r-ink-2)]">
                Retailor is free for your first three tailorings per browser —
                no account, no credit card. That’s usually enough to try it on
                a couple of real postings and decide whether to keep it around.
              </p>
            </div>
            <div className="flex items-center gap-4" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-accent)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-accent)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--r-accent)]" />
              <span className="text-sm text-[var(--r-ink-3)]">3 free uses</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="flex flex-col gap-6 border-t border-[var(--r-border)] py-10 sm:flex-row sm:items-center sm:justify-between">
        <Wordmark size={22} />
        <p className="text-xs text-[var(--r-ink-3)]">
          Free for your first three tailorings — no account, no credit card.
        </p>
      </footer>
    </div>
  );
}
