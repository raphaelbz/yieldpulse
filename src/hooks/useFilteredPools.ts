// ============================================================
// YieldPulse — useFilteredPools hook
// Applies client-side filters + sort to the full pool dataset
// ============================================================

import { useMemo } from "react"
import { usePools } from "@/hooks/usePools"
import { applyFilters } from "@/lib/filters"
import { useAppStore, selectFilters, selectSort } from "@/store/useAppStore"
import type { Pool, SortField } from "@/types"

function sortPools(pools: Pool[], field: SortField, direction: "asc" | "desc"): Pool[] {
  return [...pools].sort((a, b) => {
    const aVal = (a[field] ?? -Infinity) as number
    const bVal = (b[field] ?? -Infinity) as number
    return direction === "desc" ? bVal - aVal : aVal - bVal
  })
}

export function useFilteredPools() {
  const { pools, isLoading, isError, error, isFetching, dataUpdatedAt, refetch } = usePools()
  const filters = useAppStore(selectFilters)
  const sort = useAppStore(selectSort)

  const filteredPools = useMemo(() => {
    if (!pools.length) return []
    const filtered = applyFilters(pools, filters)
    return sortPools(filtered, sort.field, sort.direction)
  }, [pools, filters, sort])

  return {
    pools: filteredPools,
    totalPools: pools.length,
    filteredCount: filteredPools.length,
    isLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
    refetch,
  }
}
