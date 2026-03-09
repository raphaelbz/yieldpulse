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

function SortHeader({ col }: { col: Column }) {
  const sort = useAppStore(selectSort)
  const setSort = useAppStore((s) => s.setSort)
  const isActive = sort.field === col.key

  if (!col.sortable) {
    return (
      <span className={cn(
        "text-[11px] font-medium text-zinc-600 uppercase tracking-widest",
        col.align === "right" && "text-right block"
      )}>
        {col.label}
      </span>
    )
  }

  return (
    <button
      onClick={() => setSort(col.key as SortField)}
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium uppercase tracking-widest transition-colors duration-150 hover:text-white cursor-pointer",
        col.align === "right" && "ml-auto",
        isActive ? "text-green-400" : "text-zinc-600"
      )}
    >
      {col.label}
      {isActive ? (
        sort.direction === "desc" ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
      ) : (
        <ChevronsUpDown className="h-3 w-3 opacity-30" />
      )}
    </button>
  )
}

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
        "grid items-center gap-4 px-4 h-full border-b border-white/[0.04] last:border-0",
        "hover:bg-white/[0.03] cursor-pointer transition-colors duration-150 group",
        isCompared && "bg-green-500/[0.05]"
      )}
      style={{ gridTemplateColumns: GRID }}
      role="row"
    >
      {/* Pool identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative shrink-0">
          <ProtocolLogo project={pool.project} size={22} />
          <div className="absolute -bottom-0.5 -right-0.5">
            <ChainLogo chain={pool.chain} size={11} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">{pool.symbol}</p>
          <p className="text-[11px] text-zinc-600 truncate">{formatProtocolName(pool.project)}</p>
        </div>
      </div>

      {/* APY */}
      <div className="text-right"><APYBadge apy={pool.apy} /></div>
      {/* Base */}
      <div className="text-right"><APYBadge apy={pool.apyBase} size="sm" /></div>
      {/* Reward */}
      <div className="text-right"><APYBadge apy={pool.apyReward} size="sm" /></div>
      {/* TVL */}
      <div className="text-right">
        <span className="text-sm font-mono tabular-nums text-zinc-400">{formatTVL(pool.tvlUsd)}</span>
      </div>
      {/* 7d change */}
      <div className="text-right"><APYChange value={pool.apyPct7D} /></div>
      {/* 30d avg */}
      <div className="text-right"><APYBadge apy={pool.apyMean30d} size="sm" /></div>
      {/* Risk */}
      <div><RiskBadge level={risk.level} score={risk.score} /></div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={(e) => e.stopPropagation()}>
        <Tooltip>
          <TooltipTrigger
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150 cursor-pointer",
              isWatched
                ? "text-amber-400 bg-amber-500/[0.08] hover:bg-amber-500/[0.12]"
                : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05]"
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
              "inline-flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150",
              isCompared
                ? "text-green-400 bg-green-500/[0.08] hover:bg-green-500/[0.12]"
                : "text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05]",
              !canCompare && "opacity-30 cursor-not-allowed"
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

function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#000000] overflow-hidden">
      <div className="grid gap-4 px-4 py-3.5 border-b border-white/[0.05]" style={{ gridTemplateColumns: GRID }}>
        {COLUMNS.map((col) => <Skeleton key={col.key} className="h-2.5 w-12 bg-white/[0.06]" />)}
      </div>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="grid gap-4 px-4 py-3.5 border-b border-white/[0.04]" style={{ gridTemplateColumns: GRID }}>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-6 rounded-lg bg-white/[0.06]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20 bg-white/[0.06]" />
              <Skeleton className="h-2.5 w-14 bg-white/[0.04]" />
            </div>
          </div>
          {Array.from({ length: COLUMNS.length - 1 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-14 ml-auto bg-white/[0.05]" />
          ))}
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#000000] flex flex-col items-center justify-center py-20 text-center">
      <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
        <ChevronsUpDown className="h-5 w-5 text-zinc-600" />
      </div>
      <p className="text-zinc-300 font-medium mb-1">No pools match your filters</p>
      <p className="text-zinc-600 text-sm mb-5">Try adjusting the criteria</p>
      <Button variant="outline" size="sm" onClick={onReset}
        className="border-white/[0.1] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07] hover:text-white text-xs h-8">
        Reset filters
      </Button>
    </div>
  )
}

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
    <div className="rounded-2xl border border-white/[0.07] bg-[#000000] overflow-hidden">
      {/* Header */}
      <div
        className="grid gap-4 px-4 py-3.5 border-b border-white/[0.05] bg-[#1c1c1e]/50"
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
      <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-[11px] text-zinc-700">{pools.length.toLocaleString()} pools</span>
        <span className="text-[11px] text-zinc-700">Click a row to view details</span>
      </div>
    </div>
  )
}
