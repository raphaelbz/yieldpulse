import { Zap, ExternalLink } from "lucide-react"
import Link from "next/link"

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/alerts", label: "Alerts" },
  { href: "/compare", label: "Compare" },
  { href: "/portfolio", label: "Portfolio" },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[rgba(99,135,255,0.08)]">
      {/* Subtle gradient line at top */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/8 shadow-[0_0_12px_rgba(52,211,153,0.1)]">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                YieldPulse
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">Never miss the best yield.</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-5">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-600 hover:text-slate-300 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Attribution */}
          <a
            href="https://defillama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors duration-150"
          >
            Powered by DefiLlama
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}
