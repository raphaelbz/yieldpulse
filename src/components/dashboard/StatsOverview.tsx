"use client"

import { useMemo } from "react"
import { TrendingUp, Database, DollarSign, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTVL, formatAPY } from "@/lib/formatters"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: "green" | "blue" | "amber"
}

const ACCENT_COLORS = {
  green: {
    icon: "text-green-400 bg-green-500/[0.08] border-green-500/[0.15]",
    glow: "from-green-500/[0.12] via-green-500/[0.04]",
    top: "from-green-500/40",
  },
  blue: {
    icon: "text-blue-400 bg-blue-500/[0.08] border-blue-500/[0.15]",
    glow: "from-blue-500/[0.08] via-blue-500/[0.03]",
    top: "from-blue-500/40",
  },
  amber: {
    icon: "text-amber-400 bg-amber-500/[0.08] border-amber-500/[0.15]",
    glow: "from-amber-500/[0.08] via-amber-500/[0.03]",
    top: "from-amber-500/40",
  },
}

function StatCard({ label, value, sub, icon, accent = "green" }: StatCardProps) {
  const colors = ACCENT_COLORS[accent]
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1] group">
      {/* Gradient top border glow */}
      <div className={cn(
        "absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r to-transparent",
        colors.top, "via-transparent"
      )} />
      {/* Subtle corner radial glow */}
      <div className={cn(
        "absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-radial to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        colors.glow
      )} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-2xl font-bold font-mono tabular-nums text-white leading-none">{value}</p>
          {sub && <p className="text-xs text-zinc-600 mt-1.5">{sub}</p>}
        </div>
        <div className={cn("rounded-xl border p-2.5 shrink-0", colors.icon)}>
          <div className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-2.5 w-20 bg-white/[0.06]" />
          <Skeleton className="h-7 w-28 bg-white/[0.06]" />
          <Skeleton className="h-2.5 w-16 bg-white/[0.04]" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl bg-white/[0.06]" />
      </div>
    </div>
  )
}

interface StatsOverviewProps {
  pools: Pool[]
  isLoading: boolean
  filteredCount: number
}

export function StatsOverview({ pools, isLoading, filteredCount }: StatsOverviewProps) {
  const stats = useMemo(() => {
    if (!pools.length) return null
    const validPools = pools.filter((p) => !p.outlier && p.tvlUsd > 1_000_000)
    const stablePools = validPools.filter((p) => p.stablecoin && p.apy !== null)
    const allWithApy = validPools.filter((p) => p.apy !== null)
    const totalTvl = validPools.reduce((sum, p) => sum + p.tvlUsd, 0)
    const highestApyAll = Math.max(...allWithApy.map((p) => p.apy ?? 0))
    const highestApyStable = stablePools.length ? Math.max(...stablePools.map((p) => p.apy ?? 0)) : 0
    const avgStableApy = stablePools.length
      ? stablePools.reduce((sum, p) => sum + (p.apy ?? 0), 0) / stablePools.length
      : 0
    return { totalTvl, highestApyAll, highestApyStable, avgStableApy }
  }, [pools])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
      <StatCard
        label="Total TVL tracked"
        value={formatTVL(stats.totalTvl)}
        sub={`${filteredCount.toLocaleString()} pools tracked`}
        icon={<Database className="h-4 w-4" />}
        accent="blue"
      />
      <StatCard
        label="Highest APY"
        value={formatAPY(stats.highestApyAll)}
        sub="Excluding outliers"
        icon={<TrendingUp className="h-4 w-4" />}
        accent="green"
      />
      <StatCard
        label="Best stable APY"
        value={formatAPY(stats.highestApyStable)}
        sub="Stablecoin pools"
        icon={<DollarSign className="h-4 w-4" />}
        accent="green"
      />
      <StatCard
        label="Avg stable APY"
        value={formatAPY(stats.avgStableApy)}
        sub="TVL > $1M"
        icon={<Activity className="h-4 w-4" />}
        accent="amber"
      />
    </div>
  )
}
