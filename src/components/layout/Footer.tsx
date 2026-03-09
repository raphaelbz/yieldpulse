import { Zap, ExternalLink } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo + tagline */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">YieldPulse</span>
            <span className="text-zinc-600 text-xs ml-2">Never miss the best yield again.</span>
          </div>

          {/* Attribution */}
          <a
            href="https://defillama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Powered by DefiLlama
            <ExternalLink className="h-3 w-3" />
          </a>

          {/* Links */}
          <nav className="flex items-center gap-4">
            {[
              { href: "/", label: "Dashboard" },
              { href: "/watchlist", label: "Watchlist" },
              { href: "/alerts", label: "Alerts" },
              { href: "/compare", label: "Compare" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
