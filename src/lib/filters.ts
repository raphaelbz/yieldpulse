// ============================================================
// YieldPulse — Client-side Filter Logic
// All filtering is done on the in-memory pool dataset
// ============================================================

import type { FilterState, Pool } from "@/types"

/**
 * Apply all active filters to the pool array.
 * Returns a filtered (and sorted) subset of pools.
 */
export function applyFilters(pools: Pool[], filters: FilterState): Pool[] {
  let result = pools

  // Exclude outliers
  if (filters.excludeOutliers) {
    result = result.filter((p) => !p.outlier)
  }

  // Min TVL
  result = result.filter((p) => p.tvlUsd >= filters.minTvl)

  // Chain filter (multi-select)
  if (filters.chains.length > 0) {
    result = result.filter((p) => filters.chains.includes(p.chain))
  }

  // Protocol filter (multi-select)
  if (filters.protocols.length > 0) {
    result = result.filter((p) => filters.protocols.includes(p.project))
  }

  // Token search
  if (filters.tokenSearch.trim()) {
    const q = filters.tokenSearch.trim().toUpperCase()
    result = result.filter((p) => p.symbol.toUpperCase().includes(q))
  }

  // Global search (symbol + project + chain)
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter(
      (p) =>
        p.symbol.toLowerCase().includes(q) ||
        p.project.toLowerCase().includes(q) ||
        p.chain.toLowerCase().includes(q)
    )
  }

  // Stablecoin only
  if (filters.stablecoinOnly) {
    result = result.filter((p) => p.stablecoin)
  }

  // Single exposure only (no impermanent loss risk)
  if (filters.singleExposureOnly) {
    result = result.filter((p) => p.exposure === "single")
  }

  // APY range
  result = result.filter((p) => {
    const apy = p.apy ?? 0
    return apy >= filters.apyMin && apy <= filters.apyMax
  })

  return result
}

/**
 * Get unique, sorted list of chains from pool data.
 */
export function getUniqueChains(pools: Pool[]): string[] {
  return [...new Set(pools.map((p) => p.chain))].sort()
}

/**
 * Get unique, sorted list of protocols from pool data.
 */
export function getUniqueProtocols(pools: Pool[]): string[] {
  return [...new Set(pools.map((p) => p.project))].sort()
}

/**
 * Count pools per chain.
 */
export function countByChain(pools: Pool[]): Record<string, number> {
  return pools.reduce<Record<string, number>>((acc, p) => {
    acc[p.chain] = (acc[p.chain] ?? 0) + 1
    return acc
  }, {})
}

/**
 * Count pools per protocol.
 */
export function countByProtocol(pools: Pool[]): Record<string, number> {
  return pools.reduce<Record<string, number>>((acc, p) => {
    acc[p.project] = (acc[p.project] ?? 0) + 1
    return acc
  }, {})
}
