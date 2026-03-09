"use client"

import Link from "next/link"
import { ArrowLeft, Star, GitCompare, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { APYChange } from "@/components/ui/custom/APYChange"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { RiskBadge } from "@/components/ui/custom/RiskBadge"
import { formatTVL, formatProtocolName } from "@/lib/formatters"
import { computeRiskScore } from "@/lib/risk"
import { useAppStore } from "@/store/useAppStore"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

interface PoolHeaderProps {
  pool: Pool
}

export function PoolHeader({ pool }: PoolHeaderProps) {
  const watchlist = useAppStore((s) => s.watchlist)
  const addToWatchlist = useAppStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useAppStore((s) => s.removeFromWatchlist)
  const compareSelection = useAppStore((s) => s.compareSelection)
  const addToCompare = useAppStore((s) => s.addToCompare)
  const removeFromCompare = useAppStore((s) => s.removeFromCompare)

  const isWatched = watchlist.includes(pool.pool)
  const isCompared = compareSelection.includes(pool.pool)
  const canCompare = compareSelection.length < 4 || isCompared
  const risk = computeRiskScore(pool)

  return (
    <div className="space-y-4">
      {/* Back nav */}
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-8 text-xs text-zinc-500 hover:text-white px-2 -ml-2"
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
        Back to dashboard
      </Link>

      {/* Main header card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Left: Identity */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <ProtocolLogo project={pool.project} size={48} />
              <div className="absolute -bottom-1 -right-1">
                <ChainLogo chain={pool.chain} size={20} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{pool.symbol}</h1>
                {pool.stablecoin && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                    Stablecoin
                  </Badge>
                )}
                {pool.exposure === "single" && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    Single asset
                  </Badge>
                )}
                <RiskBadge level={risk.level} score={risk.score} />
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <ProtocolLogo project={pool.project} size={14} />
                  {formatProtocolName(pool.project)}
                </span>
                <span className="text-zinc-700">·</span>
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <ChainLogo chain={pool.chain} size={14} />
                  {pool.chain}
                </span>
                {pool.poolMeta && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="text-sm text-zinc-500">{pool.poolMeta}</span>
                  </>
                )}
              </div>

              <p className="text-xs text-zinc-600 mt-2 font-mono">{pool.pool}</p>
            </div>
          </div>

          {/* Right: APY + actions */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {/* Main APY */}
            <div className="text-right">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total APY</p>
              <APYBadge apy={pool.apy} size="lg" />
              <div className="flex items-center gap-3 mt-1 justify-end">
                <span className="text-xs text-zinc-500">
                  Base <APYBadge apy={pool.apyBase} size="sm" />
                </span>
                <span className="text-xs text-zinc-500">
                  Reward <APYBadge apy={pool.apyReward} size="sm" />
                </span>
              </div>
            </div>

            {/* TVL + changes */}
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="text-xs text-zinc-500">TVL</p>
                <p className="text-sm font-mono font-semibold text-zinc-200">{formatTVL(pool.tvlUsd)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">24h</p>
                <APYChange value={pool.apyPct1D} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">7d</p>
                <APYChange value={pool.apyPct7D} />
              </div>
              <div>
                <p className="text-xs text-zinc-500">30d</p>
                <APYChange value={pool.apyPct30D} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => isWatched ? removeFromWatchlist(pool.pool) : addToWatchlist(pool.pool)}
                className={cn(
                  "h-8 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700",
                  isWatched ? "text-amber-400 border-amber-500/30" : "text-zinc-400"
                )}
              >
                <Star className={cn("h-3.5 w-3.5 mr-1.5", isWatched && "fill-current")} />
                {isWatched ? "Watching" : "Watch"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => isCompared ? removeFromCompare(pool.pool) : addToCompare(pool.pool)}
                disabled={!canCompare}
                className={cn(
                  "h-8 text-xs border-zinc-700 bg-zinc-800 hover:bg-zinc-700",
                  isCompared ? "text-green-400 border-green-500/30" : "text-zinc-400"
                )}
              >
                <GitCompare className="h-3.5 w-3.5 mr-1.5" />
                {isCompared ? "Comparing" : "Compare"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PoolHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-36 bg-zinc-800" />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48 bg-zinc-800" />
            <Skeleton className="h-4 w-36 bg-zinc-800" />
            <Skeleton className="h-3 w-72 bg-zinc-800" />
          </div>
          <div className="hidden lg:flex flex-col items-end gap-3">
            <Skeleton className="h-10 w-28 bg-zinc-800" />
            <Skeleton className="h-4 w-40 bg-zinc-800" />
            <Skeleton className="h-8 w-32 bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
