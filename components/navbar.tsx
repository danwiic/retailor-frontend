"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark";

export function Navbar({
  tagline = false,
  onReset,
}: {
  tagline?: boolean;
  onReset?: () => void;
}) {
  const pathname = usePathname();
  const isWorkspace = pathname === "/";

  return (
    <header className="topbar">
      <Link href="/" aria-label="Retailor home">
        <Wordmark inverse />
      </Link>
      {tagline && <span className="topbar__note">A private workspace for one application</span>}
      <nav className="topnav" aria-label="Primary">
        {isWorkspace ? (
          <button type="button" onClick={onReset}>
            Start over
          </button>
        ) : (
          <Link href="/">Start an application</Link>
        )}
      </nav>
    </header>
  );
}
