"use client"

import { useRef, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Star, GitCompare, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { APYChange } from "@/components/ui/custom/APYChange"
import { RiskBadge } from "@/components/ui/custom/RiskBadge"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { computeRiskScore } from "@/lib/risk"
import { formatTVL, formatProtocolName } from "@/lib/formatters"
import { useAppStore, selectSort, selectCompare } from "@/store/useAppStore"
import type { Pool, SortField } from "@/types"
import { cn } from "@/lib/utils"

// ─── Column config ────────────────────────────────────────────────────────────

interface Column {
  key: SortField | "pool" | "risk" | "actions"
  label: string
  sortable: boolean
  align?: "left" | "right"
  width: string
}

const COLUMNS: Column[] = [
  { key: "pool", label: "Pool", sortable: false, align: "left", width: "minmax(220px, 1fr)" },
  { key: "apy", label: "APY", sortable: true, align: "right", width: "90px" },
  { key: "apyBase", label: "Base", sortable: true, align: "right", width: "80px" },
  { key: "apyReward", label: "Reward", sortable: true, align: "right", width: "80px" },
  { key: "tvlUsd", label: "TVL", sortable: true, align: "right", width: "100px" },
  { key: "apyPct7D", label: "7d Chg", sortable: true, align: "right", width: "80px" },
  { key: "apyMean30d", label: "30d Avg", sortable: true, align: "right", width: "90px" },
  { key: "risk", label: "Risk", sortable: false, align: "left", width: "90px" },
  { key: "actions", label: "", sortable: false, align: "right", width: "70px" },
]

const GRID = COLUMNS.map((c) => c.width).join(" ")
const ROW_HEIGHT = 52

// ─── Sort Header ──────────────────────────────────────────────────────────────

function SortHeader({ col }: { col: Column }) {
  const sort = useAppStore(selectSort)
  const setSort = useAppStore((s) => s.setSort)
  const isActive = sort.field === col.key

  if (!col.sortable) {
    return (
      <span className={cn("text-xs font-medium text-zinc-500 uppercase tracking-wide", col.align === "right" && "text-right block")}>
        {col.label}
      </span>
    )
  }

  return (
    <button
      onClick={() => setSort(col.key as SortField)}
      className={cn(
        "flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors hover:text-white cursor-pointer",
        col.align === "right" && "ml-auto",
        isActive ? "text-green-400" : "text-zinc-500"
      )}
    >
      {col.label}
      {isActive ? (
        sort.direction === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  )
}

// ─── Pool Row ─────────────────────────────────────────────────────────────────

function PoolRow({ pool }: { pool: Pool }) {
  const router = useRouter()
  const watchlist = useAppStore((s) => s.watchlist)
  const addToWatchlist = useAppStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useAppStore((s) => s.removeFromWatchlist)
  const compareSelection = useAppStore(selectCompare)
  const addToCompare = useAppStore((s) => s.addToCompare)
  const removeFromCompare = useAppStore((s) => s.removeFromCompare)

  const isWatched = watchlist.includes(pool.pool)
  const isCompared = compareSelection.includes(pool.pool)
  const canCompare = compareSelection.length < 4 || isCompared
  const risk = useMemo(() => computeRiskScore(pool), [pool])

  return (
    <div
      onClick={() => router.push(`/pool/${pool.pool}`)}
      className={cn(
        "grid items-center gap-4 px-4 h-full border-b border-zinc-800/50",
        "hover:bg-zinc-800/40 cursor-pointer transition-colors duration-100",
        isCompared && "bg-green-500/5"
      )}
      style={{ gridTemplateColumns: GRID }}
      role="row"
    >
      {/* Pool */}
      <div className="flex items-center gap-2 min-w-0">
        <ProtocolLogo project={pool.project} size={22} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{pool.symbol}</p>
          <p className="text-xs text-zinc-500 truncate">{formatProtocolName(pool.project)}</p>
        </div>
        <ChainLogo chain={pool.chain} size={14} className="shrink-0 ml-0.5" />
      </div>

      {/* APY */}
      <div className="text-right"><APYBadge apy={pool.apy} /></div>
      {/* Base */}
      <div className="text-right"><APYBadge apy={pool.apyBase} size="sm" /></div>
      {/* Reward */}
      <div className="text-right"><APYBadge apy={pool.apyReward} size="sm" /></div>
      {/* TVL */}
      <div className="text-right">
        <span className="text-sm font-mono tabular-nums text-zinc-300">{formatTVL(pool.tvlUsd)}</span>
      </div>
      {/* 7d */}
      <div className="text-right"><APYChange value={pool.apyPct7D} /></div>
      {/* 30d avg */}
      <div className="text-right"><APYBadge apy={pool.apyMean30d} size="sm" /></div>
      {/* Risk */}
      <div><RiskBadge level={risk.level} score={risk.score} /></div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors cursor-pointer",
              isWatched ? "text-amber-400 hover:text-amber-300" : "text-zinc-600 hover:text-zinc-300"
            )}
            onClick={(e) => {
              e.stopPropagation()
              isWatched ? removeFromWatchlist(pool.pool) : addToWatchlist(pool.pool)
            }}
          >
            <Star className={cn("h-3.5 w-3.5", isWatched && "fill-current")} />
          </TooltipTrigger>
          <TooltipContent side="top">
            {isWatched ? "Remove from watchlist" : "Add to watchlist"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              isCompared ? "text-green-400 hover:text-green-300" : "text-zinc-600 hover:text-zinc-300",
              !canCompare && "opacity-40 cursor-not-allowed"
            )}
            disabled={!canCompare}
            onClick={(e) => {
              e.stopPropagation()
              isCompared ? removeFromCompare(pool.pool) : addToCompare(pool.pool)
            }}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top">
            {isCompared ? "Remove from compare" : canCompare ? "Add to compare" : "Max 4 pools"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="grid gap-4 px-4 py-3 border-b border-zinc-800" style={{ gridTemplateColumns: GRID }}>
        {COLUMNS.map((col) => <Skeleton key={col.key} className="h-3 w-12 bg-zinc-800" />)}
      </div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="grid gap-4 px-4 py-4 border-b border-zinc-800/50" style={{ gridTemplateColumns: GRID }}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-md bg-zinc-800" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 bg-zinc-800" />
              <Skeleton className="h-3 w-14 bg-zinc-800" />
            </div>
          </div>
          {Array.from({ length: COLUMNS.length - 1 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-14 ml-auto bg-zinc-800" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center py-20 text-center">
      <p className="text-zinc-400 font-medium mb-2">No pools match your filters</p>
      <p className="text-zinc-600 text-sm mb-4">Try adjusting the criteria</p>
      <Button variant="outline" size="sm" onClick={onReset} className="border-zinc-700 text-zinc-300 text-xs">
        Reset filters
      </Button>
    </div>
  )
}

// ─── Main PoolTable ───────────────────────────────────────────────────────────

interface PoolTableProps {
  pools: Pool[]
  isLoading: boolean
  onReset: () => void
}

export function PoolTable({ pools, isLoading, onReset }: PoolTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: pools.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => ROW_HEIGHT, []),
    overscan: 10,
  })

  if (isLoading) return <TableSkeleton />
  if (!pools.length) return <EmptyState onReset={onReset} />

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header row */}
      <div
        className="grid gap-4 px-4 py-3 border-b border-zinc-800"
        style={{ gridTemplateColumns: GRID }}
        role="row"
      >
        {COLUMNS.map((col) => (
          <div key={col.key}>
            <SortHeader col={col} />
          </div>
        ))}
      </div>

      {/* Virtualised body */}
      <div
        ref={parentRef}
        className="overflow-y-auto"
        style={{ height: Math.min(pools.length * ROW_HEIGHT, 720) }}
        role="rowgroup"
      >
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {rowVirtualizer.getVirtualItems().map((vRow) => (
            <div
              key={vRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              <PoolRow pool={pools[vRow.index]} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-600">{pools.length.toLocaleString()} pools</span>
        <span className="text-xs text-zinc-600">Click row to view details</span>
      </div>
    </div>
  )
}
