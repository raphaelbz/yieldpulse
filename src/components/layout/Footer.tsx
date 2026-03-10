import { Zap, ExternalLink } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.05]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/[0.08] border border-green-500/[0.15]">
              <Zap className="h-3.5 w-3.5 text-green-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">YieldPulse</span>
              <p className="text-[11px] text-zinc-600 mt-0.5">Never miss the best yield again.</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-5">
            {["/", "/watchlist", "/alerts", "/compare", "/portfolio"].map((href, i) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors duration-150"
              >
                {["Dashboard", "Watchlist", "Alerts", "Compare", "Portfolio"][i]}
              </Link>
            ))}
          </nav>

          {/* Attribution */}
          <a
            href="https://defillama.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-150"
          >
            Powered by DefiLlama
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}
