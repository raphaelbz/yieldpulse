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
  accent?: "green" | "blue" | "amber" | "purple"
}

const ACCENT = {
  green: {
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    glow: "shadow-[0_0_30px_rgba(52,211,153,0.08)]",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]",
    valueColor: "text-emerald-50",
    bar: "bg-gradient-to-r from-emerald-500/60 to-emerald-400/20",
    borderAccent: "rgba(52,211,153,0.15)",
  },
  blue: {
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    glow: "shadow-[0_0_30px_rgba(99,135,255,0.08)]",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(99,135,255,0.15)]",
    valueColor: "text-blue-50",
    bar: "bg-gradient-to-r from-blue-500/60 to-blue-400/20",
    borderAccent: "rgba(99,135,255,0.15)",
  },
  amber: {
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.06)]",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(251,191,36,0.12)]",
    valueColor: "text-amber-50",
    bar: "bg-gradient-to-r from-amber-500/60 to-amber-400/20",
    borderAccent: "rgba(251,191,36,0.15)",
  },
  purple: {
    icon: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    glow: "shadow-[0_0_30px_rgba(168,85,247,0.06)]",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]",
    valueColor: "text-purple-50",
    bar: "bg-gradient-to-r from-purple-500/60 to-purple-400/20",
    borderAccent: "rgba(168,85,247,0.15)",
  },
}

function StatCard({ label, value, sub, icon, accent = "green" }: StatCardProps) {
  const a = ACCENT[accent]
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[rgba(99,135,255,0.1)] bg-[#090d18] p-5 overflow-hidden",
        "transition-all duration-300 cursor-default group",
        a.glow,
        a.hoverGlow,
        "hover:border-[rgba(99,135,255,0.18)] hover:-translate-y-0.5"
      )}
      style={{
        background: `linear-gradient(135deg, #090d18 0%, #0e1525 100%)`,
      }}
    >
      {/* Subtle gradient accent at top */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-60"
        style={{ background: `linear-gradient(90deg, transparent, ${a.borderAccent}, transparent)` }}
      />

      {/* Background glow blob */}
      <div
        className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
        style={{ background: a.borderAccent }}
      />

      <div className="relative flex items-start justify-between mb-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.1em]">{label}</p>
        <div className={cn("rounded-xl border p-2 shrink-0 transition-all duration-200 group-hover:scale-110", a.iconBg)}>
          <div className={cn("h-3.5 w-3.5 [&>svg]:h-3.5 [&>svg]:w-3.5", a.icon)}>{icon}</div>
        </div>
      </div>

      <p className={cn(
        "relative text-[28px] font-bold font-mono tabular-nums leading-none tracking-tight",
        a.valueColor
      )}>
        {value}
      </p>

      {sub && (
        <p className="text-[11px] text-slate-600 mt-2 leading-tight">{sub}</p>
      )}

      {/* Bottom accent bar */}
      <div className={cn("absolute bottom-0 left-0 h-[2px] w-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full", a.bar)} />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[rgba(99,135,255,0.07)] bg-[#090d18] p-5">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-2.5 w-20 bg-white/[0.05] skeleton-shimmer" />
        <Skeleton className="h-9 w-9 rounded-xl bg-white/[0.04]" />
      </div>
      <Skeleton className="h-7 w-28 bg-white/[0.06] skeleton-shimmer" />
      <Skeleton className="h-2.5 w-16 bg-white/[0.03] mt-2.5" />
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
