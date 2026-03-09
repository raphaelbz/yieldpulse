"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { RiskBadge } from "@/components/ui/custom/RiskBadge"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { computeRiskScore } from "@/lib/risk"
import { formatTVL, formatProtocolName } from "@/lib/formatters"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

// ─── Helper: extract base token from composite symbols ────────────────────────
// "USDC-USDT" → ["USDC", "USDT"], "USDC" → ["USDC"]
function parseTokens(symbol: string): string[] {
  return symbol.split(/[-/]/).map((t) => t.trim().toUpperCase())
}

// Find pools sharing at least one token with the reference pool
function findSimilar(pool: Pool, allPools: Pool[], limit = 6): Pool[] {
  const refTokens = parseTokens(pool.symbol)

  return allPools
    .filter((p) => {
      if (p.pool === pool.pool) return false               // exclude self
      if (p.outlier) return false                          // exclude outliers
      if (p.tvlUsd < 100_000) return false                 // min TVL
      if (p.apy === null) return false

      const pTokens = parseTokens(p.symbol)
      return refTokens.some((t) => pTokens.includes(t))   // at least one shared token
    })
    .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
    .slice(0, limit)
}

// ─── Pool card ────────────────────────────────────────────────────────────────

function SimilarPoolCard({ pool, currentPoolId }: { pool: Pool; currentPoolId: string }) {
  const risk = useMemo(() => computeRiskScore(pool), [pool])
  const isCurrent = pool.pool === currentPoolId

  return (
    <Link
      href={`/pool/${pool.pool}`}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3",
        "hover:border-green-500/30 hover:bg-zinc-800/60 transition-all duration-150",
        isCurrent && "border-green-500/40 bg-green-500/5 pointer-events-none"
      )}
    >
      {/* Header: protocol + chain */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <ProtocolLogo project={pool.project} size={20} />
          <span className="text-xs text-zinc-400 truncate">{formatProtocolName(pool.project)}</span>
        </div>
        <ChainLogo chain={pool.chain} size={16} showName={false} />
      </div>

      {/* Symbol */}
      <div>
        <p className="text-sm font-semibold text-white truncate">{pool.symbol}</p>
        {pool.poolMeta && (
          <p className="text-xs text-zinc-600 truncate">{pool.poolMeta}</p>
        )}
      </div>

      {/* APY + TVL */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-zinc-500 mb-0.5">APY</p>
          <APYBadge apy={pool.apy} size="md" />
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 mb-0.5">TVL</p>
          <p className="text-xs font-mono text-zinc-400">{formatTVL(pool.tvlUsd)}</p>
        </div>
      </div>

      {/* Risk badge */}
      <div className="flex items-center justify-between">
        <RiskBadge level={risk.level} score={risk.score} />
        <ArrowRight className="h-3.5 w-3.5 text-zinc-700" />
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SimilarPoolSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-md bg-zinc-800" />
        <Skeleton className="h-3 w-24 bg-zinc-800" />
      </div>
      <Skeleton className="h-4 w-20 bg-zinc-800" />
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16 bg-zinc-800" />
        <Skeleton className="h-4 w-14 bg-zinc-800" />
      </div>
      <Skeleton className="h-5 w-20 bg-zinc-800 rounded-full" />
    </div>
  )
}

// ─── SimilarPools ─────────────────────────────────────────────────────────────

interface SimilarPoolsProps {
  pool: Pool
  allPools: Pool[]
  isLoading: boolean
}

export function SimilarPools({ pool, allPools, isLoading }: SimilarPoolsProps) {
  const similar = useMemo(
    () => findSimilar(pool, allPools),
    [pool, allPools]
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Similar Pools
        </h2>
        <span className="text-xs text-zinc-600">Same token, all protocols</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SimilarPoolSkeleton key={i} />)}
        </div>
      ) : similar.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 py-10 text-center text-sm text-zinc-600">
          No similar pools found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {similar.map((p) => (
            <SimilarPoolCard key={p.pool} pool={p} currentPoolId={pool.pool} />
          ))}
        </div>
      )}
    </div>
  )
}
