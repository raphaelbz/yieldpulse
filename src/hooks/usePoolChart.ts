// ============================================================
// YieldPulse — usePoolChart hook
// Fetches historical APY/TVL data for a specific pool
// ============================================================

import { useQuery } from "@tanstack/react-query"
import { fetchPoolChart } from "@/lib/api"
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants"
import type { ChartDataPoint } from "@/types"

export interface UsePoolChartResult {
  data: ChartDataPoint[]
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function usePoolChart(poolId: string | undefined): UsePoolChartResult {
  const query = useQuery({
    queryKey: QUERY_KEYS.poolChart(poolId ?? ""),
    queryFn: async () => {
      const res = await fetchPoolChart(poolId!)
      if (res.status !== "success") {
        throw new Error(`DefiLlama chart API failed for pool ${poolId}`)
      }
      return res.data
    },
    enabled: Boolean(poolId),
    staleTime: STALE_TIME.poolChart,
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}
