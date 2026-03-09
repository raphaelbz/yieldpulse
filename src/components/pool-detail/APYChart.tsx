"use client"

import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import type { ChartDataPoint, TimeRange } from "@/types"
import { cn } from "@/lib/utils"

// ─── Time range filter ────────────────────────────────────────────────────────

const TIME_RANGES: { label: string; value: TimeRange; days: number }[] = [
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "1Y", value: "1y", days: 365 },
]

function filterByTimeRange(data: ChartDataPoint[], days: number): ChartDataPoint[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return data.filter((d) => new Date(d.timestamp).getTime() >= cutoff)
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
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
  payload?: TooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  const date = label
    ? new Date(label).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : ""

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#111113]/95 p-3 shadow-xl backdrop-blur-sm text-xs">
      <p className="text-zinc-400 mb-2 font-medium">{date}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400">{entry.name}</span>
          </span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {entry.value !== null && entry.value !== undefined
              ? `${entry.value.toFixed(2)}%`
              : "—"}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── APYChart ─────────────────────────────────────────────────────────────────

interface APYChartProps {
  data: ChartDataPoint[]
  isLoading: boolean
}

export function APYChart({ data, isLoading }: APYChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const filtered = useMemo(() => {
    const days = TIME_RANGES.find((r) => r.value === timeRange)?.days ?? 30
    return filterByTimeRange(data, days)
  }, [data, timeRange])

  const chartData = useMemo(() =>
    filtered.map((d) => ({
      timestamp: d.timestamp,
      "Total APY": d.apy,
      "Base APY": d.apyBase,
      "Reward APY": d.apyReward,
    })),
    [filtered]
  )

  if (isLoading) return <ChartSkeleton label="APY History" />

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">APY History</h2>
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
          No historical data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="apyTotalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="apyBaseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="apyRewardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="timestamp"
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

            <Area
              type="monotone"
              dataKey="Total APY"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#apyTotalGrad)"
              dot={false}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="Base APY"
              stroke="#3b82f6"
              strokeWidth={1.5}
              fill="url(#apyBaseGrad)"
              dot={false}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="Reward APY"
              stroke="#a78bfa"
              strokeWidth={1.5}
              fill="url(#apyRewardGrad)"
              dot={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─── TVLChart ─────────────────────────────────────────────────────────────────

interface TVLChartProps {
  data: ChartDataPoint[]
  isLoading: boolean
}

export function TVLChart({ data, isLoading }: TVLChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d")

  const filtered = useMemo(() => {
    const days = TIME_RANGES.find((r) => r.value === timeRange)?.days ?? 30
    return filterByTimeRange(data, days)
  }, [data, timeRange])

  const chartData = useMemo(() =>
    filtered.map((d) => ({
      timestamp: d.timestamp,
      "TVL (USD)": d.tvlUsd,
    })),
    [filtered]
  )

  function formatTVLTick(v: number): string {
    if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`
    return `$${v}`
  }

  if (isLoading) return <ChartSkeleton label="TVL History" />

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">TVL History</h2>
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
          No historical data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatTVLTick}
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              formatter={(v) => {
                const num = typeof v === "number" ? v : 0
                return [`$${(num / 1_000_000).toFixed(2)}M`, "TVL"] as [string, string]
              }}
              labelFormatter={(l) => {
                const s = typeof l === "string" ? l : String(l ?? "")
                return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              }}
              contentStyle={{
                background: "oklch(0.148 0.003 264)",
                border: "1px solid oklch(0.21 0.003 264)",
                borderRadius: "8px",
                fontSize: 11,
              }}
              labelStyle={{ color: "#a1a1aa" }}
              itemStyle={{ color: "#f59e0b" }}
            />

            <Area
              type="monotone"
              dataKey="TVL (USD)"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#tvlGrad)"
              dot={false}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

// ─── Shared subcomponents ─────────────────────────────────────────────────────

function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange
  onChange: (v: TimeRange) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
      {TIME_RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "h-6 px-2.5 rounded-md text-xs font-medium transition-all",
            value === r.value
              ? "bg-zinc-800 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}

function ChartSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-4 w-28 bg-zinc-800" />
        <Skeleton className="h-7 w-36 bg-zinc-800" />
      </div>
      <Skeleton className="h-64 w-full bg-[#1a1a1c]/50 rounded-lg" />
    </div>
  )
}
