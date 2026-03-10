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
  { href: "/portfolio", label: "Portfolio" },
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
            ? "border border-[rgba(99,135,255,0.15)] bg-[#030508]/90 backdrop-blur-2xl shadow-[0_4px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "border border-[rgba(99,135,255,0.1)] bg-[#090d18]/80 backdrop-blur-xl shadow-[0_2px_16px_rgba(0,0,0,0.3)]"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 transition-all duration-200 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/15 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.2)]">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            YieldPulse
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm rounded-xl transition-all duration-200",
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {link.label}
                {isActive && (
                  <>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-emerald-400/80" />
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-5 rounded-full bg-emerald-400/40 blur-sm" />
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-[220px]">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search pools…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full rounded-xl border border-[rgba(99,135,255,0.12)] bg-[rgba(255,255,255,0.03)] py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[rgba(99,135,255,0.12)] bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-4 right-4 mt-1.5 rounded-2xl border border-[rgba(99,135,255,0.15)] bg-[#030508]/98 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7)] p-3 space-y-1 animate-fade-in">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search pools…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full rounded-xl border border-[rgba(99,135,255,0.12)] bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/40 focus:outline-none transition-all"
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
                    ? "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
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
