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

const ACCENT = {
  green: { icon: "text-green-400", bg: "bg-green-500/[0.08]", border: "border-green-500/[0.12]" },
  blue:  { icon: "text-blue-400",  bg: "bg-blue-500/[0.08]",  border: "border-blue-500/[0.12]"  },
  amber: { icon: "text-amber-400", bg: "bg-amber-500/[0.08]", border: "border-amber-500/[0.12]" },
}

function StatCard({ label, value, sub, icon, accent = "green" }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-5 transition-colors duration-200 hover:bg-[#2c2c2e] hover:border-white/[0.1]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">{label}</p>
        <div className={cn("rounded-xl border p-2 shrink-0", a.bg, a.border)}>
          <div className={cn("h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5", a.icon)}>{icon}</div>
        </div>
      </div>
      <p className="text-[28px] font-bold font-mono tabular-nums text-white leading-none tracking-tight">
        {value}
      </p>
      {sub && <p className="text-[11px] text-zinc-600 mt-2 leading-tight">{sub}</p>}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#1c1c1e] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-2.5 w-20 bg-white/[0.06]" />
        <Skeleton className="h-9 w-9 rounded-xl bg-white/[0.05]" />
      </div>
      <Skeleton className="h-7 w-28 bg-white/[0.07]" />
      <Skeleton className="h-2.5 w-16 bg-white/[0.04] mt-2.5" />
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
        label="Total TVL"
        value={formatTVL(stats.totalTvl)}
        sub={`${filteredCount.toLocaleString()} pools tracked`}
        icon={<Database />}
        accent="blue"
      />
      <StatCard
        label="Highest APY"
        value={formatAPY(stats.highestApyAll)}
        sub="Excluding outliers"
        icon={<TrendingUp />}
        accent="green"
      />
      <StatCard
        label="Best Stable APY"
        value={formatAPY(stats.highestApyStable)}
        sub="Stablecoin pools"
        icon={<DollarSign />}
        accent="green"
      />
      <StatCard
        label="Avg Stable APY"
        value={formatAPY(stats.avgStableApy)}
        sub="TVL > $1M"
        icon={<Activity />}
        accent="amber"
      />
    </div>
  )
}
