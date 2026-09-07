"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wordmark } from "./wordmark";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isWorkspace = pathname === "/";

  function restart() {
    try {
      sessionStorage.removeItem("retailor.workflow");
    } catch {
      /* storage may be unavailable */
    }
    router.push("/");
  }

  return (
    <header className="topbar">
      <Link href="/" aria-label="Retailor home">
        <Wordmark inverse />
      </Link>
      <span className="topbar__note">A private workspace for one application</span>
      <nav className="topnav" aria-label="Main navigation">
        <Link href="/how-it-works">How it works</Link>
        {isWorkspace ? (
          <button type="button" onClick={restart}>Start over</button>
        ) : (
          <Link href="/">Start an application</Link>
        )}
        <a href="https://danpirante.dev" target="_blank" rel="noreferrer">Built by Dan</a>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </header>
  );
}
