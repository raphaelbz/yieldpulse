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
      className="group flex-none w-44 relative rounded-2xl border border-white/[0.07] bg-[#111113] p-4 transition-colors duration-200 hover:bg-[#141416] hover:border-white/[0.12]"
    >
      {/* Rank */}
      <span className="absolute top-3.5 right-3.5 text-[10px] font-mono text-zinc-700 tabular-nums">
        #{rank}
      </span>

      {/* Protocol */}
      <div className="flex items-center gap-2 mb-3">
        <ProtocolLogo project={pool.project} size={16} />
        <span className="text-[11px] text-zinc-500 truncate leading-none">
          {formatProtocolName(pool.project)}
        </span>
      </div>

      {/* Symbol + chain */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-sm font-semibold text-zinc-100 truncate max-w-[7rem] leading-none">
          {pool.symbol}
        </span>
        <ChainLogo chain={pool.chain} size={13} />
      </div>

      {/* APY */}
      <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-[0.1em] mb-1">APY</p>
      <p className="text-2xl font-bold font-mono tabular-nums text-green-400 leading-none">
        {formatAPY(pool.apy)}
      </p>
      <p className="text-[11px] font-mono text-zinc-600 mt-2 leading-none">
        {formatTVL(pool.tvlUsd)} TVL
      </p>
    </Link>
  )
}

function TopYieldCardSkeleton() {
  return (
    <div className="flex-none w-44 rounded-2xl border border-white/[0.06] bg-[#111113] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-4 rounded-full bg-white/[0.06]" />
        <Skeleton className="h-2.5 w-16 bg-white/[0.05]" />
      </div>
      <Skeleton className="h-3.5 w-20 bg-white/[0.06] mb-3.5" />
      <Skeleton className="h-2 w-5 bg-white/[0.04] mb-1" />
      <Skeleton className="h-6 w-20 bg-white/[0.07]" />
      <Skeleton className="h-2.5 w-14 bg-white/[0.04] mt-2" />
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-300">Top Stablecoin Yields</h2>
        <span className="text-[11px] text-zinc-600">Sorted by APY</span>
      </div>

      {/* Scrollable row with edge fade */}
      <div className="relative">
        <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <TopYieldCardSkeleton key={i} />)
            : topPools.map((pool, i) => (
                <TopYieldCard key={pool.pool} pool={pool} rank={i + 1} />
              ))}
        </div>
        {/* Right edge fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#09090b] to-transparent" />
      </div>
    </div>
  )
}
