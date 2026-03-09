"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { formatAPY, formatTVL, formatProtocolName } from "@/lib/formatters"
import type { Pool } from "@/types"

function TopYieldCard({ pool, rank }: { pool: Pool; rank: number }) {
  return (
    <Link
      href={`/pool/${pool.pool}`}
      className="group flex-none w-48 relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* Rank badge */}
      <div className="absolute top-3 right-3 text-[10px] font-mono text-zinc-700">
        #{rank}
      </div>

      {/* Protocol logo + name */}
      <div className="flex items-center gap-2 mb-3">
        <ProtocolLogo project={pool.project} size={18} />
        <span className="text-[11px] text-zinc-500 truncate">{formatProtocolName(pool.project)}</span>
      </div>

      {/* Token + chain */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white truncate max-w-[6.5rem]">{pool.symbol}</span>
        <ChainLogo chain={pool.chain} size={14} />
      </div>

      {/* APY — big hero number */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">APY</p>
        <p className="text-2xl font-bold font-mono tabular-nums text-green-400 group-hover:text-green-300 transition-colors">
          {formatAPY(pool.apy)}
        </p>
        <p className="text-[11px] font-mono text-zinc-600 mt-1">{formatTVL(pool.tvlUsd)} TVL</p>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  )
}

function TopYieldCardSkeleton() {
  return (
    <div className="flex-none w-48 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded-full bg-white/[0.06]" />
        <Skeleton className="h-2.5 w-16 bg-white/[0.06]" />
      </div>
      <Skeleton className="h-4 w-20 bg-white/[0.06] mb-4" />
      <Skeleton className="h-2 w-6 bg-white/[0.04] mb-1" />
      <Skeleton className="h-7 w-20 bg-white/[0.06]" />
    </div>
  )
}

export function TopYieldsBar({ pools, isLoading }: { pools: Pool[]; isLoading: boolean }) {
  const topPools = useMemo(() => {
    return pools
      .filter((p) => p.stablecoin && p.apy !== null && !p.outlier && p.tvlUsd > 1_000_000)
      .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
      .slice(0, 10)
  }, [pools])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
          Top Stablecoin Yields
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <TopYieldCardSkeleton key={i} />)
          : topPools.map((pool, i) => (
              <TopYieldCard key={pool.pool} pool={pool} rank={i + 1} />
            ))}
      </div>
    </div>
  )
}
