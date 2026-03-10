"use client"

import { useQuery } from "@tanstack/react-query"
import { getPoolDirectUrl } from "@/lib/protocolUrls"
import { fetchCurvePoolsForChain, resolveCurvePoolUrl, curveChainPoolsUrl } from "@/lib/curveApi"
import type { Pool } from "@/types"

const CURVE_PROJECTS = new Set(["curve", "curve-dex"])

/**
 * Resolves the best direct URL for a pool.
 *
 * For Curve pools: queries the Curve Finance API (per-chain, cached 30 min)
 * to find the pool contract address from underlyingTokens, then returns
 * the specific /deposit URL.
 *
 * For all other protocols: returns synchronously from getPoolDirectUrl().
 */
export function usePoolDirectUrl(pool: Pool): string {
  const isCurve = CURVE_PROJECTS.has(pool.project)

  const { data: resolvedCurveUrl } = useQuery({
    // Key is per-chain — all Curve pools on the same chain share one cached fetch
    queryKey: ["curvePools", pool.chain],
    queryFn: () => fetchCurvePoolsForChain(pool.chain),
    enabled: isCurve && (pool.underlyingTokens?.length ?? 0) > 0,
    staleTime: 30 * 60 * 1000,   // 30 min — Curve pools don't change often
    gcTime: 60 * 60 * 1000,      // keep in cache 1 hr
    select: (curvePools) =>
      resolveCurvePoolUrl(curvePools, pool.chain, pool.underlyingTokens ?? []),
  })

  if (isCurve) {
    return resolvedCurveUrl ?? curveChainPoolsUrl(pool.chain)
  }

  return getPoolDirectUrl(pool)
}
