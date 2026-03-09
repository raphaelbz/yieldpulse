"use client"

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ApiErrorBanner } from "@/components/layout/ApiErrorBanner"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { TopYieldsBar } from "@/components/dashboard/TopYieldsBar"
import { FilterBar } from "@/components/filters/FilterBar"
import { PoolTable } from "@/components/dashboard/PoolTable"
import { CompareBar } from "@/components/dashboard/CompareBar"
import { AlertEngine } from "@/components/alerts/AlertEngine"
import { useFilteredPools } from "@/hooks/useFilteredPools"
import { usePools } from "@/hooks/usePools"
import { useAppStore } from "@/store/useAppStore"
import { formatLastUpdated } from "@/lib/formatters"

export function DashboardClient() {
  const {
    pools: filteredPools,
    totalPools,
    filteredCount,
    isLoading,
    isError,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useFilteredPools()

  const { pools: allPools } = usePools()
  const resetFilters = useAppStore((s) => s.resetFilters)
  const lastRefreshedAt = useAppStore((s) => s.lastRefreshedAt)

  const lastUpdated = lastRefreshedAt
    ? formatLastUpdated(new Date(lastRefreshedAt))
    : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page ambient glow — subtle green at top, invisible without close inspection */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 -top-64 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Yield Markets</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {isLoading
              ? "Loading pools…"
              : `${totalPools.toLocaleString()} pools across DeFi`}
          </p>
        </div>

        {/* API error banner */}
        {isError && <ApiErrorBanner onRetry={refetch} />}

        {/* Stats */}
        <StatsOverview
          pools={allPools}
          isLoading={isLoading}
          filteredCount={filteredCount}
        />

        {/* Top yields horizontal bar */}
        <TopYieldsBar pools={allPools} isLoading={isLoading} />

        {/* Filter bar */}
        <div className="space-y-2">
          <FilterBar
            allPools={allPools}
            filteredCount={filteredCount}
            totalCount={totalPools}
            isFetching={isFetching}
            onRefetch={refetch}
          />
          {lastUpdated && (
            <p className="text-xs text-zinc-600">
              Last updated {lastUpdated}
            </p>
          )}
        </div>

        {/* Pool Table */}
        <PoolTable
          pools={filteredPools}
          isLoading={isLoading}
          onReset={resetFilters}
        />
      </main>

      <Footer />

      {/* Floating compare bar — appears when 2+ pools selected */}
      <CompareBar />

      {/* Invisible: checks alerts on every 5-min data refresh */}
      <AlertEngine />
    </div>
  )
}
