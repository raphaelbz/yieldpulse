"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChartDataPoint, TimeRange } from "@/types"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

// ─── Pool color palette (max 4) ───────────────────────────────────────────────

export const POOL_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a78bfa"] as const

// ─── Time range toggle ────────────────────────────────────────────────────────

const TIME_RANGES: { label: string; value: TimeRange; days: number }[] = [
  { label: "7D",  value: "7d",  days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "1Y",  value: "1y",  days: 365 },
]

function filterByDays(data: ChartDataPoint[], days: number): ChartDataPoint[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return data.filter((d) => new Date(d.timestamp).getTime() >= cutoff)
}

// ─── Merge multiple pool series on a shared time axis ────────────────────────
// Strategy: align on date string (YYYY-MM-DD), outer join

interface MergedRow {
  date: string
  [poolLabel: string]: number | string | null
}

function mergeChartData(
  pools: Pool[],
  chartDataList: ChartDataPoint[][],
  days: number
): MergedRow[] {
  // Build a map: date → { poolLabel: apy }
  const merged = new Map<string, MergedRow>()

  pools.forEach((pool, idx) => {
    const label = `${pool.symbol} (${pool.chain})`
    const filtered = filterByDays(chartDataList[idx] ?? [], days)

    filtered.forEach((d) => {
      const date = d.timestamp.slice(0, 10) // YYYY-MM-DD
      if (!merged.has(date)) merged.set(date, { date })
      const row = merged.get(date)!
      row[label] = d.apy
    })
  })

  return Array.from(merged.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => row)
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface TooltipEntry {
  name: string
  value: number | null
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const date = label
    ? new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : ""

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#111113]/95 p-3 shadow-xl text-xs backdrop-blur-sm min-w-[180px]">
      <p className="text-zinc-400 mb-2 font-medium">{date}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5 text-zinc-400 truncate max-w-[120px]">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
            <span className="truncate">{e.name}</span>
          </span>
          <span className="font-mono font-semibold shrink-0" style={{ color: e.color }}>
            {e.value !== null && e.value !== undefined ? `${(e.value as number).toFixed(2)}%` : "—"}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── CompareChart ─────────────────────────────────────────────────────────────

interface CompareChartProps {
  pools: Pool[]
  chartDataList: ChartDataPoint[][]
  isLoading: boolean
}

export function CompareChart({ pools, chartDataList, isLoading }: CompareChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")
  const days = TIME_RANGES.find((r) => r.value === timeRange)?.days ?? 30

  const chartData = useMemo(
    () => mergeChartData(pools, chartDataList, days),
    [pools, chartDataList, days]
  )

  const poolLabels = pools.map((p) => `${p.symbol} (${p.chain})`)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
        <div className="flex items-center justify-between mb-5">
          <Skeleton className="h-4 w-28 bg-zinc-800" />
          <Skeleton className="h-7 w-40 bg-zinc-800" />
        </div>
        <Skeleton className="h-72 w-full bg-[#1a1a1c]/50 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">APY Comparison</h2>
        {/* Time range toggle */}
        <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={cn(
                "h-6 px-2.5 rounded-md text-xs font-medium transition-all",
                timeRange === r.value ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-zinc-600 text-sm">
          No chart data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#71717a", paddingTop: 12 }}
              iconType="circle"
              iconSize={8}
            />
            {poolLabels.map((label, idx) => (
              <Line
                key={label}
                type="monotone"
                dataKey={label}
                stroke={POOL_COLORS[idx % POOL_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
