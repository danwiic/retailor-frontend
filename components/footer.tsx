import Link from 'next/link'

export function SiteLinks() {
  return (
    <>
      <Link href="/how-it-works">How it works</Link>
      <a href="https://danpirante.dev" target="_blank" rel="noreferrer">
        Built by Dan
      </a>
      <Link href="/privacy">Privacy</Link>
      <Link href="/terms">Terms</Link>
    </>
  )
}

export function SiteFooter({ mobileOnly = false }: { mobileOnly?: boolean }) {
  return (
    <footer className={`site-footer ${mobileOnly ? 'site-footer--mobile-only' : ''}`}>
      <nav className="site-footer__links" aria-label="Footer">
        <SiteLinks />
      </nav>
    </footer>
  )
}
