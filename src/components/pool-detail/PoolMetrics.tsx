"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { APYChange } from "@/components/ui/custom/APYChange"
import { formatTVL, formatAPY, formatIL, formatNumber } from "@/lib/formatters"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

interface MetricCellProps {
  label: string
  value: React.ReactNode
  sub?: string
  className?: string
}

function MetricCell({ label, value, sub, className }: MetricCellProps) {
  return (
    <div className={cn("rounded-lg border border-white/[0.07] bg-[#1c1c1e]/50 p-4", className)}>
      <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-1.5">{label}</p>
      <div className="text-sm font-mono tabular-nums">{value}</div>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

interface PoolMetricsProps {
  pool: Pool
}

export function PoolMetrics({ pool }: PoolMetricsProps) {
  const rewardRatio = pool.apy && pool.apy > 0
    ? ((pool.apyReward ?? 0) / pool.apy) * 100
    : 0

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Pool Metrics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* APY group */}
        <MetricCell
          label="Total APY"
          value={<APYBadge apy={pool.apy} size="md" />}
          sub="Base + Reward"
        />
        <MetricCell
          label="Base APY"
          value={<APYBadge apy={pool.apyBase} size="md" />}
          sub="Protocol yield"
        />
        <MetricCell
          label="Reward APY"
          value={<APYBadge apy={pool.apyReward} size="md" />}
          sub={`${rewardRatio.toFixed(0)}% of total`}
        />
        <MetricCell
          label="7d Avg APY"
          value={<APYBadge apy={pool.apyBase7d} size="md" />}
          sub="Base only"
        />

        {/* Changes */}
        <MetricCell
          label="1d Change"
          value={<APYChange value={pool.apyPct1D} className="text-sm" />}
        />
        <MetricCell
          label="7d Change"
          value={<APYChange value={pool.apyPct7D} className="text-sm" />}
        />
        <MetricCell
          label="30d Change"
          value={<APYChange value={pool.apyPct30D} className="text-sm" />}
        />
        <MetricCell
          label="30d Mean APY"
          value={<APYBadge apy={pool.apyMean30d} size="md" />}
          sub="Rolling average"
        />

        {/* Pool info */}
        <MetricCell
          label="TVL"
          value={<span className="text-white">{formatTVL(pool.tvlUsd)}</span>}
          sub="Total Value Locked"
        />
        <MetricCell
          label="Volume 1d"
          value={<span className="text-zinc-300">{formatTVL(pool.volumeUsd1d)}</span>}
        />
        <MetricCell
          label="Volume 7d"
          value={<span className="text-zinc-300">{formatTVL(pool.volumeUsd7d)}</span>}
        />
        <MetricCell
          label="IL 7d"
          value={
            <span className={cn(
              "font-mono",
              pool.il7d === null ? "text-zinc-500" :
              (pool.il7d ?? 0) < 0 ? "text-red-400" : "text-zinc-300"
            )}>
              {pool.il7d === null ? "—" : formatIL(pool.il7d)}
            </span>
          }
          sub="Impermanent loss"
        />

        {/* Flags */}
        <MetricCell
          label="Exposure"
          value={
            <span className={cn(
              "capitalize",
              pool.exposure === "single" ? "text-green-400" : "text-amber-400"
            )}>
              {pool.exposure}
            </span>
          }
          sub={pool.exposure === "single" ? "No IL risk" : "IL risk possible"}
        />
        <MetricCell
          label="IL Risk"
          value={
            <span className={pool.ilRisk === "no" ? "text-green-400" : "text-red-400"}>
              {pool.ilRisk === "no" ? "Low" : "Yes"}
            </span>
          }
        />
        <MetricCell
          label="Type"
          value={<span className="text-zinc-300 capitalize">{pool.poolMeta ?? "Standard"}</span>}
        />
        <MetricCell
          label="Stablecoin"
          value={
            <span className={pool.stablecoin ? "text-blue-400" : "text-zinc-400"}>
              {pool.stablecoin ? "Yes" : "No"}
            </span>
          }
        />
      </div>
    </div>
  )
}

export function PoolMetricsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-28 bg-zinc-800" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-[#1c1c1e]/50 p-4 space-y-2">
            <Skeleton className="h-3 w-20 bg-zinc-800" />
            <Skeleton className="h-5 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
