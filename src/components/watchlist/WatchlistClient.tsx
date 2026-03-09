"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Star, Download, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PoolTable } from "@/components/dashboard/PoolTable"
import { useAppStore } from "@/store/useAppStore"
import { usePools } from "@/hooks/usePools"
import { formatAPY, formatTVL, formatLastUpdated } from "@/lib/formatters"
import { computeRiskScore } from "@/lib/risk"
import { cn } from "@/lib/utils"
import type { Pool } from "@/types"

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(pools: Pool[]) {
  const header = "Symbol,Protocol,Chain,APY,Base APY,Reward APY,TVL,Risk Score,Pool ID"
  const rows = pools.map((p) => {
    const risk = computeRiskScore(p)
    return [
      p.symbol,
      p.project,
      p.chain,
      formatAPY(p.apy),
      formatAPY(p.apyBase),
      formatAPY(p.apyReward),
      formatTVL(p.tvlUsd),
      risk.score,
      p.pool,
    ].join(",")
  })
  const csv = [header, ...rows].join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `yieldpulse-watchlist-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function WatchlistEmpty() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="rounded-full bg-zinc-800 p-4 mb-4">
        <Star className="h-8 w-8 text-zinc-600" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Your watchlist is empty</h2>
      <p className="text-zinc-500 text-sm mb-6 max-w-sm">
        Star any pool from the dashboard or pool detail page to add it here.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "sm" }),
          "bg-green-500 hover:bg-green-400 text-black font-semibold border-transparent"
        )}
      >
        Browse pools
        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
      </Link>
    </div>
  )
}

// ─── Stats mini-bar ───────────────────────────────────────────────────────────

function WatchlistStats({ pools }: { pools: Pool[] }) {
  const stats = useMemo(() => {
    const withApy = pools.filter((p) => p.apy !== null)
    if (!withApy.length) return null
    const avgApy = withApy.reduce((s, p) => s + (p.apy ?? 0), 0) / withApy.length
    const bestApy = Math.max(...withApy.map((p) => p.apy ?? 0))
    const totalTvl = pools.reduce((s, p) => s + p.tvlUsd, 0)
    return { avgApy, bestApy, totalTvl }
  }, [pools])

  if (!stats) return null

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Avg APY", value: formatAPY(stats.avgApy) },
        { label: "Best APY", value: formatAPY(stats.bestApy) },
        { label: "Combined TVL", value: formatTVL(stats.totalTvl) },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-lg font-bold font-mono tabular-nums text-white">{value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function WatchlistClient() {
  const watchlist = useAppStore((s) => s.watchlist)
  const resetFilters = useAppStore((s) => s.resetFilters)
  const lastRefreshedAt = useAppStore((s) => s.lastRefreshedAt)

  const { pools: allPools, isLoading } = usePools()

  const watchedPools = useMemo(
    () => allPools.filter((p) => watchlist.includes(p.pool)),
    [allPools, watchlist]
  )

  const lastUpdated = lastRefreshedAt
    ? formatLastUpdated(new Date(lastRefreshedAt))
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              Watchlist
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {isLoading
                ? "Loading…"
                : `${watchedPools.length} pool${watchedPools.length !== 1 ? "s" : ""} tracked`}
              {lastUpdated && ` · Updated ${lastUpdated}`}
            </p>
          </div>

          {watchedPools.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(watchedPools)}
              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white text-xs"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 bg-zinc-800 rounded-lg" />
            ))}
          </div>
        ) : (
          watchedPools.length > 0 && <WatchlistStats pools={watchedPools} />
        )}

        {/* Table or empty */}
        {isLoading ? (
          <PoolTable pools={[]} isLoading onReset={resetFilters} />
        ) : watchedPools.length === 0 ? (
          <WatchlistEmpty />
        ) : (
          <PoolTable
            pools={watchedPools}
            isLoading={false}
            onReset={resetFilters}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
