"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { APYChange } from "@/components/ui/custom/APYChange"
import { RiskBadge } from "@/components/ui/custom/RiskBadge"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { computeRiskScore } from "@/lib/risk"
import { formatTVL, formatAPY, formatProtocolName } from "@/lib/formatters"
import type { Pool } from "@/types"
import { POOL_COLORS } from "@/components/compare/CompareChart"
import { cn } from "@/lib/utils"

// ─── Highlight helpers ────────────────────────────────────────────────────────

// Returns index of the pool with the highest numeric value (null = ignore)
function bestIdx(values: (number | null)[]): number {
  let best = -Infinity
  let idx = -1
  values.forEach((v, i) => {
    if (v !== null && v > best) { best = v; idx = i }
  })
  return idx
}

// Returns index with lowest numeric value
function worstIdx(values: (number | null)[]): number {
  let worst = Infinity
  let idx = -1
  values.forEach((v, i) => {
    if (v !== null && v < worst) { worst = v; idx = i }
  })
  return idx
}

// ─── Row types ────────────────────────────────────────────────────────────────

interface MetricRow {
  label: string
  values: (pool: Pool) => (number | null)
  render: (pool: Pool) => React.ReactNode
  highlight?: "best-high" | "best-low"  // which pool to highlight green
}

const METRIC_ROWS: MetricRow[] = [
  {
    label: "Total APY",
    values: (p) => p.apy,
    render: (p) => <APYBadge apy={p.apy} size="md" />,
    highlight: "best-high",
  },
  {
    label: "Base APY",
    values: (p) => p.apyBase,
    render: (p) => <APYBadge apy={p.apyBase} size="sm" />,
    highlight: "best-high",
  },
  {
    label: "Reward APY",
    values: (p) => p.apyReward,
    render: (p) => <APYBadge apy={p.apyReward} size="sm" />,
    highlight: "best-high",
  },
  {
    label: "30d Avg APY",
    values: (p) => p.apyMean30d,
    render: (p) => <APYBadge apy={p.apyMean30d} size="sm" />,
    highlight: "best-high",
  },
  {
    label: "TVL",
    values: (p) => p.tvlUsd,
    render: (p) => <span className="font-mono tabular-nums text-sm text-zinc-200">{formatTVL(p.tvlUsd)}</span>,
    highlight: "best-high",
  },
  {
    label: "24h Change",
    values: (p) => p.apyPct1D,
    render: (p) => <APYChange value={p.apyPct1D} />,
  },
  {
    label: "7d Change",
    values: (p) => p.apyPct7D,
    render: (p) => <APYChange value={p.apyPct7D} />,
  },
  {
    label: "30d Change",
    values: (p) => p.apyPct30D,
    render: (p) => <APYChange value={p.apyPct30D} />,
  },
  {
    label: "Risk Score",
    values: (p) => computeRiskScore(p).score,
    render: (p) => {
      const risk = computeRiskScore(p)
      return <RiskBadge level={risk.level} score={risk.score} />
    },
    highlight: "best-low",
  },
  {
    label: "Stablecoin",
    values: () => null,
    render: (p) => (
      <span className={p.stablecoin ? "text-blue-400 text-xs" : "text-zinc-500 text-xs"}>
        {p.stablecoin ? "Yes" : "No"}
      </span>
    ),
  },
  {
    label: "Exposure",
    values: () => null,
    render: (p) => (
      <span className={cn(
        "text-xs capitalize",
        p.exposure === "single" ? "text-green-400" : "text-amber-400"
      )}>
        {p.exposure}
      </span>
    ),
  },
  {
    label: "IL Risk",
    values: () => null,
    render: (p) => (
      <span className={cn("text-xs", p.ilRisk === "no" ? "text-green-400" : "text-red-400")}>
        {p.ilRisk === "no" ? "None" : "Yes"}
      </span>
    ),
  },
]

// ─── Pool header column ───────────────────────────────────────────────────────

function PoolColumn({
  pool,
  color,
  onRemove,
}: {
  pool: Pool
  color: string
  onRemove: () => void
}) {
  return (
    <th className="text-left p-4 font-normal align-top min-w-[180px]">
      {/* Color strip */}
      <div className="h-1 rounded-full mb-3" style={{ backgroundColor: color }} />

      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/pool/${pool.pool}`}
          className="flex items-start gap-2 group min-w-0"
        >
          <div className="relative shrink-0">
            <ProtocolLogo project={pool.project} size={32} />
            <div className="absolute -bottom-1 -right-1">
              <ChainLogo chain={pool.chain} size={14} />
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors truncate">
              {pool.symbol}
            </p>
            <p className="text-xs text-zinc-500 truncate">{formatProtocolName(pool.project)}</p>
            <p className="text-xs text-zinc-600 truncate">{pool.chain}</p>
          </div>
        </Link>

        <button
          onClick={onRemove}
          className="shrink-0 text-zinc-700 hover:text-red-400 transition-colors mt-0.5"
          title="Remove from compare"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </th>
  )
}

// ─── CompareTable ─────────────────────────────────────────────────────────────

interface CompareTableProps {
  pools: Pool[]
  onRemove: (poolId: string) => void
}

export function CompareTable({ pools, onRemove }: CompareTableProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            {/* Row label column */}
            <th className="text-left p-4 text-xs font-medium text-zinc-500 uppercase tracking-wide w-32 align-bottom">
              Metric
            </th>
            {pools.map((pool, idx) => (
              <PoolColumn
                key={pool.pool}
                pool={pool}
                color={POOL_COLORS[idx % POOL_COLORS.length]}
                onRemove={() => onRemove(pool.pool)}
              />
            ))}
          </tr>
        </thead>

        <tbody>
          {METRIC_ROWS.map((row) => {
            const rawValues = pools.map(row.values)
            const highlightBest =
              row.highlight === "best-high" ? bestIdx(rawValues) : -1
            const highlightWorst =
              row.highlight === "best-low" ? worstIdx(rawValues) : -1

            return (
              <tr
                key={row.label}
                className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors"
              >
                {/* Label */}
                <td className="p-4 text-xs text-zinc-500 font-medium align-middle whitespace-nowrap">
                  {row.label}
                </td>

                {/* Pool values */}
                {pools.map((pool, idx) => {
                  const isBest  = idx === highlightBest
                  const isWorst = idx === highlightWorst

                  return (
                    <td
                      key={pool.pool}
                      className={cn(
                        "p-4 align-middle",
                        isBest  && "bg-green-500/5",
                        isWorst && "bg-red-500/5"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {row.render(pool)}
                        {isBest && (
                          <span className="text-[10px] text-green-500 font-semibold leading-none">▲</span>
                        )}
                        {isWorst && (
                          <span className="text-[10px] text-red-500 font-semibold leading-none">▼</span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function CompareTableSkeleton({ count }: { count: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="flex border-b border-zinc-800 p-4 gap-4">
        <Skeleton className="h-5 w-24 bg-zinc-800" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex-1 space-y-2">
            <Skeleton className="h-1 w-full bg-zinc-800 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg bg-zinc-800" />
            <Skeleton className="h-4 w-20 bg-zinc-800" />
            <Skeleton className="h-3 w-16 bg-zinc-800" />
          </div>
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex border-b border-zinc-800/50 p-4 gap-4 items-center">
          <Skeleton className="h-3 w-20 bg-zinc-800" />
          {Array.from({ length: count }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-5 bg-zinc-800" />
          ))}
        </div>
      ))}
    </div>
  )
}
