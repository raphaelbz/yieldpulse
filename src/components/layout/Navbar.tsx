"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, X, Zap, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/alerts", label: "Alerts" },
  { href: "/compare", label: "Compare" },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const globalSearch = useAppStore((s) => s.globalSearch)
  const setGlobalSearch = useAppStore((s) => s.setGlobalSearch)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center px-4 py-3 pointer-events-none">
      {/* Floating pill */}
      <div
        className={cn(
          "pointer-events-auto flex h-12 w-full max-w-5xl items-center justify-between gap-4 rounded-2xl px-4 transition-all duration-300",
          scrolled
            ? "border border-white/[0.1] bg-[#000000]/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border border-white/[0.07] bg-[#1c1c1e]/80 backdrop-blur-xl"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 transition-all duration-200 group-hover:bg-green-500/15 group-hover:border-green-500/30">
            <Zap className="h-3.5 w-3.5 text-green-400" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">YieldPulse</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm rounded-lg transition-all duration-200",
                  isActive
                    ? "text-white bg-white/[0.07]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-green-400/70" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search pools…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-zinc-600 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.07] transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu — drops below the pill */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-1 rounded-2xl border border-white/[0.09] bg-[#000000]/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] p-3 space-y-1 animate-fade-in">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search pools…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-green-500/40 focus:outline-none transition-all"
            />
          </div>
          <nav className="flex flex-col gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  pathname === link.href
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
