// ============================================================
// YieldPulse — usePools hook
// Fetches all pools from DefiLlama, caches for 5 min
// ============================================================

import { useQuery } from "@tanstack/react-query"
import { fetchPools } from "@/lib/api"
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants"
import { useAppStore } from "@/store/useAppStore"
import type { Pool } from "@/types"

export interface UsePoolsResult {
  pools: Pool[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  isFetching: boolean
  dataUpdatedAt: number
  refetch: () => void
}

export function usePools(): UsePoolsResult {
  const setLastRefreshedAt = useAppStore((s) => s.setLastRefreshedAt)

  const query = useQuery({
    queryKey: QUERY_KEYS.pools,
    queryFn: async () => {
      const res = await fetchPools()
      if (res.status !== "success") {
        throw new Error("DefiLlama API returned non-success status")
      }
      setLastRefreshedAt(Date.now())
      return res.data
    },
    staleTime: STALE_TIME.pools,
    refetchInterval: STALE_TIME.pools, // Background refetch every 5 min
  })

  return {
    pools: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
    refetch: query.refetch,
  }
}
