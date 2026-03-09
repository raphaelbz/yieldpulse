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

function StatCard({ label, value, sub, icon, accent = "green" }: StatCardProps) {
  const accentColor = {
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    amber: "text-amber-400 bg-amber-400/10",
  }[accent]

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
      <div className={cn("rounded-lg p-2.5 shrink-0", accentColor)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium truncate">{label}</p>
        <p className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24 bg-zinc-800" />
        <Skeleton className="h-6 w-32 bg-zinc-800" />
        <Skeleton className="h-3 w-20 bg-zinc-800" />
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
    const highestApyStable = stablePools.length
      ? Math.max(...stablePools.map((p) => p.apy ?? 0))
      : 0
    const avgStableApy = stablePools.length
      ? stablePools.reduce((sum, p) => sum + (p.apy ?? 0), 0) / stablePools.length
      : 0

    return { totalTvl, highestApyAll, highestApyStable, avgStableApy }
  }, [pools])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      <StatCard
        label="Total TVL tracked"
        value={formatTVL(stats.totalTvl)}
        sub={`${filteredCount.toLocaleString()} pools`}
        icon={<Database className="h-5 w-5" />}
        accent="blue"
      />
      <StatCard
        label="Highest APY (all)"
        value={formatAPY(stats.highestApyAll)}
        sub="Excluding outliers"
        icon={<TrendingUp className="h-5 w-5" />}
        accent="green"
      />
      <StatCard
        label="Best stable APY"
        value={formatAPY(stats.highestApyStable)}
        sub="Stablecoin pools"
        icon={<DollarSign className="h-5 w-5" />}
        accent="green"
      />
      <StatCard
        label="Avg stable APY"
        value={formatAPY(stats.avgStableApy)}
        sub="TVL > $1M"
        icon={<Activity className="h-5 w-5" />}
        accent="amber"
      />
    </div>
  )
}
