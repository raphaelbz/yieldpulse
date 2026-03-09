"use client"

import { useMemo } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PoolHeader, PoolHeaderSkeleton } from "@/components/pool-detail/PoolHeader"
import { APYChart, TVLChart } from "@/components/pool-detail/APYChart"
import { PoolMetrics, PoolMetricsSkeleton } from "@/components/pool-detail/PoolMetrics"
import { RiskAssessment } from "@/components/pool-detail/RiskAssessment"
import { SimilarPools } from "@/components/pool-detail/SimilarPools"
import { usePools } from "@/hooks/usePools"
import { usePoolChart } from "@/hooks/usePoolChart"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PoolDetailClientProps {
  poolId: string
}

export function PoolDetailClient({ poolId }: PoolDetailClientProps) {
  const { pools, isLoading: poolsLoading, isError: poolsError } = usePools()
  const { data: chartData, isLoading: chartLoading } = usePoolChart(poolId)

  const pool = useMemo(
    () => pools.find((p) => p.pool === poolId) ?? null,
    [pools, poolId]
  )

  const isLoading = poolsLoading

  // ── Error state ──────────────────────────────────────────────────────────
  if (poolsError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="text-white font-semibold">Failed to load pool data</p>
          <p className="text-zinc-500 text-sm">Could not reach the DefiLlama API.</p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-zinc-700 text-zinc-300")}
          >
            Back to dashboard
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Pool not found (after data loaded) ───────────────────────────────────
  if (!isLoading && !pool) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-white font-semibold text-xl">Pool not found</p>
          <p className="text-zinc-500 text-sm">
            Pool <span className="font-mono text-zinc-400">{poolId}</span> does not exist or has been removed.
          </p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-zinc-700 text-zinc-300")}
          >
            Browse all pools
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 -top-64 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />
      </div>
      <Navbar />

      <main className="relative z-10 flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        {isLoading || !pool ? (
          <PoolHeaderSkeleton />
        ) : (
          <PoolHeader pool={pool} />
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-4">
          <APYChart data={chartData} isLoading={chartLoading} />
          <TVLChart data={chartData} isLoading={chartLoading} />
        </div>

        {/* Metrics grid */}
        {isLoading || !pool ? (
          <PoolMetricsSkeleton />
        ) : (
          <PoolMetrics pool={pool} />
        )}

        {/* Risk + Similar — side by side on large screens */}
        {pool && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6 items-start">
            <RiskAssessment pool={pool} />
            <div className="xl:w-[700px]">
              <SimilarPools pool={pool} allPools={pools} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
