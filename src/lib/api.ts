// ============================================================
// YieldPulse — DefiLlama API Client
// Free API, no key required: https://yields.llama.fi
// ============================================================

import type { ChartApiResponse, PoolsApiResponse } from "@/types"

const BASE_URL = "https://yields.llama.fi"

/**
 * Fetch all yield pools.
 * Returns ~14,000 pools. Cache aggressively (staleTime: 5 min via TanStack Query).
 */
export async function fetchPools(): Promise<PoolsApiResponse> {
  const res = await fetch(`${BASE_URL}/pools`, {
    headers: { Accept: "application/json" },
    // Next.js: no cache on client, TanStack Query handles caching
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`DefiLlama /pools failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<PoolsApiResponse>
}

/**
 * Fetch historical APY/TVL chart data for a specific pool.
 * @param poolId - Pool UUID from Pool.pool field
 */
export async function fetchPoolChart(poolId: string): Promise<ChartApiResponse> {
  if (!poolId) throw new Error("poolId is required")

  const res = await fetch(`${BASE_URL}/chart/${encodeURIComponent(poolId)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(
      `DefiLlama /chart/${poolId} failed: ${res.status} ${res.statusText}`
    )
  }

  return res.json() as Promise<ChartApiResponse>
}
