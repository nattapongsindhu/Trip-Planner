// Global footer shown on every page
// Added per audit recommendation: "Add Legal/Compliance Footers"
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="max-w-4xl mx-auto px-4 py-8 mt-12 border-t">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Trip Planner — Portfolio project by Nattapong Sindhu
        </p>
        <nav className="flex items-center gap-4 text-xs">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <a
            href="https://github.com/nattapongsindhu/Trip-Planner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Source
          </a>
        </nav>
      </div>
    </footer>
  )
}
