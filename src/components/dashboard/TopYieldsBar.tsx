"use client"

import { useMemo } from "react"
import Link from "next/link"
import { TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { formatAPY, formatTVL, formatProtocolName } from "@/lib/formatters"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

interface TopYieldCardProps {
  pool: Pool
  rank: number
}

function TopYieldCard({ pool, rank }: TopYieldCardProps) {
  return (
    <Link
      href={`/pool/${pool.pool}`}
      className={cn(
        "flex-none w-52 rounded-xl border border-zinc-800 bg-zinc-900 p-4",
        "hover:border-green-500/40 hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <ProtocolLogo project={pool.project} size={18} />
          <span className="text-xs text-zinc-400 truncate">{formatProtocolName(pool.project)}</span>
        </div>
        <span className="text-xs font-mono text-zinc-600 shrink-0">#{rank}</span>
      </div>

      {/* Symbol + Chain */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white truncate max-w-[7rem]">{pool.symbol}</span>
        <ChainLogo chain={pool.chain} size={16} />
      </div>

      {/* APY */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">APY</p>
          <p className="text-xl font-bold font-mono text-green-400">{formatAPY(pool.apy)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 mb-0.5">TVL</p>
          <p className="text-sm font-mono text-zinc-300">{formatTVL(pool.tvlUsd)}</p>
        </div>
      </div>
    </Link>
  )
}

function TopYieldCardSkeleton() {
  return (
    <div className="flex-none w-52 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
        <Skeleton className="h-3 w-20 bg-zinc-800" />
      </div>
      <Skeleton className="h-4 w-24 bg-zinc-800 mb-3" />
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-3 w-8 bg-zinc-800 mb-1" />
          <Skeleton className="h-7 w-20 bg-zinc-800" />
        </div>
        <div>
          <Skeleton className="h-3 w-8 bg-zinc-800 mb-1" />
          <Skeleton className="h-5 w-16 bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

interface TopYieldsBarProps {
  pools: Pool[]
  isLoading: boolean
}

export function TopYieldsBar({ pools, isLoading }: TopYieldsBarProps) {
  const topPools = useMemo(() => {
    return pools
      .filter((p) => p.stablecoin && p.apy !== null && !p.outlier && p.tvlUsd > 1_000_000)
      .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
      .slice(0, 10)
  }, [pools])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-green-400" />
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Top Stablecoin Yields
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <TopYieldCardSkeleton key={i} />)
          : topPools.map((pool, i) => (
              <TopYieldCard key={pool.pool} pool={pool} rank={i + 1} />
            ))}
      </div>
    </div>
  )
}
