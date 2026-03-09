// ============================================================
// YieldPulse — useCompareCharts
// Fetches chart data for multiple pools in parallel via useQueries
// ============================================================

import { useQueries } from "@tanstack/react-query"
import { fetchPoolChart } from "@/lib/api"
import { QUERY_KEYS, STALE_TIME } from "@/lib/constants"
import type { ChartDataPoint } from "@/types"

export interface PoolChartResult {
  poolId: string
  data: ChartDataPoint[]
  isLoading: boolean
  isError: boolean
}

export function useCompareCharts(poolIds: string[]): PoolChartResult[] {
  const results = useQueries({
    queries: poolIds.map((id) => ({
      queryKey: QUERY_KEYS.poolChart(id),
      queryFn: async (): Promise<ChartDataPoint[]> => {
        const res = await fetchPoolChart(id)
        if (res.status !== "success") throw new Error(`Chart fetch failed for ${id}`)
        return res.data
      },
      enabled: Boolean(id),
      staleTime: STALE_TIME.poolChart,
    })),
  })

  return poolIds.map((id, i) => ({
    poolId: id,
    data: results[i]?.data ?? [],
    isLoading: results[i]?.isLoading ?? false,
    isError: results[i]?.isError ?? false,
  }))
}
