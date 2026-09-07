export function Wordmark({ size = 26, inverse = false }: { size?: number; inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-hidden
        className="flex-none"
      >
        <rect width="64" height="64" rx="15" fill="oklch(42% 0.13 250)" />
        <g fill="oklch(99% 0.005 250)">
          <path d="M17 47V17h15c6.2 0 9.8 3.4 9.8 7.9 0 3.2-2 5.5-4.8 6.4 3.5.9 5.8 3.3 5.8 7 0 5.2-4 7.7-10.8 7.7H17Zm9-17.2h5.1c2.7 0 4.1-1 4.1-2.9s-1.4-2.9-4.1-2.9H26v5.8Zm0 8h5.9c3 0 4.6-1.1 4.6-3.2 0-2.1-1.6-3.2-4.6-3.2H26v6.4Z" />
          <circle cx="52" cy="12" r="3.2" />
        </g>
      </svg>
      <span
        className={`font-display text-[1.1875rem] font-semibold tracking-[-0.02em] ${
          inverse ? "text-[var(--r-on-ink)]" : "text-[var(--r-ink)]"
        }`}
      >
        Retailor
      </span>
    </span>
  );
}