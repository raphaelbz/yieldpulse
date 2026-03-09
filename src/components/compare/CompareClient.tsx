"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Link2, GitCompareArrows } from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CompareChart } from "@/components/compare/CompareChart"
import { CompareTable, CompareTableSkeleton } from "@/components/compare/CompareTable"
import { PoolSelector } from "@/components/compare/PoolSelector"
import { usePools } from "@/hooks/usePools"
import { useCompareCharts } from "@/hooks/useCompareCharts"
import { useAppStore } from "@/store/useAppStore"
import type { Pool } from "@/types"

interface CompareClientProps {
  initialPoolIds: string[]
}

export function CompareClient({ initialPoolIds }: CompareClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pools } = usePools()
  const addToCompare = useAppStore((s) => s.addToCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)

  const [selectedIds, setSelectedIds] = useState<string[]>(initialPoolIds)

  // Sync URL when selection changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedIds.length > 0) {
      params.set("pools", selectedIds.join(","))
    } else {
      params.delete("pools")
    }
    router.replace(`/compare?${params.toString()}`, { scroll: false })
    // Sync Zustand compareSelection so CompareBar on dashboard reflects state
    clearCompare()
    selectedIds.forEach((id) => addToCompare(id))
  }, [selectedIds, router, searchParams, addToCompare, clearCompare])

  const handleAdd = useCallback((poolId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(poolId) || prev.length >= 4) return prev
      return [...prev, poolId]
    })
  }, [])

  const handleRemove = useCallback((poolId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== poolId))
  }, [])

  const handleCopyLink = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard")
    }).catch(() => {
      toast.error("Failed to copy link")
    })
  }, [])

  // Resolve Pool objects from IDs
  const selectedPools: Pool[] = selectedIds
    .map((id) => pools.find((p) => p.pool === id))
    .filter((p): p is Pool => p !== undefined)

  // Fetch chart data in parallel
  const chartResults = useCompareCharts(selectedIds)
  const chartDataList = chartResults.map((r) => r.data)
  const isAnyLoading = chartResults.some((r) => r.isLoading)
  // Consider loading only when we have IDs but pools haven't resolved yet
  const isPoolsLoading = selectedIds.length > 0 && selectedPools.length < selectedIds.length && pools.length === 0

  const isLoading = isAnyLoading || isPoolsLoading

  return (
    <div className="min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 -top-64 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />
      </div>
      <Navbar />

      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-green-400" />
              Compare Pools
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Select up to 4 pools to compare side-by-side
            </p>
          </div>

          {selectedIds.length >= 2 && (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded-lg px-3 py-1.5 transition-colors hover:border-zinc-500"
            >
              <Link2 className="h-3.5 w-3.5" />
              Copy shareable link
            </button>
          )}
        </div>

        {/* Pool selector */}
        <div className="max-w-md">
          <PoolSelector
            selectedIds={selectedIds}
            onAdd={handleAdd}
            disabled={selectedIds.length >= 4}
          />
        </div>

        {/* Selected pool chips */}
        {selectedPools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPools.map((pool, idx) => {
              const colors = ["#22c55e", "#3b82f6", "#f59e0b", "#a78bfa"]
              const color = colors[idx % colors.length]
              return (
                <div
                  key={pool.pool}
                  className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1c1c1e] px-3 py-1 text-xs"
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-zinc-300 font-medium">{pool.symbol}</span>
                  <span className="text-zinc-600">{pool.chain}</span>
                  <button
                    onClick={() => handleRemove(pool.pool)}
                    className="text-zinc-600 hover:text-red-400 transition-colors ml-0.5 leading-none"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {selectedIds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <GitCompareArrows className="h-12 w-12 text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium">No pools selected</p>
            <p className="text-zinc-600 text-sm mt-1">
              Search for pools above to start comparing
            </p>
          </div>
        )}

        {selectedIds.length === 1 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-500 text-sm">
              Add at least one more pool to see the comparison
            </p>
          </div>
        )}

        {/* Chart + Table */}
        {selectedIds.length >= 2 && (
          <>
            <CompareChart
              pools={selectedPools}
              chartDataList={chartDataList}
              isLoading={isLoading}
            />

            {isLoading ? (
              <CompareTableSkeleton count={selectedIds.length} />
            ) : (
              <CompareTable
                pools={selectedPools}
                onRemove={handleRemove}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
