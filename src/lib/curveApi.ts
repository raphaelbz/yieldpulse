// Curve Finance pool lookup API
// Used to resolve DefiLlama UUID pool IDs to real Curve pool contract addresses.

// Curve's API chain names
const CURVE_API_CHAIN: Record<string, string> = {
  "Ethereum":   "ethereum",
  "Arbitrum":   "arbitrum",
  "Optimism":   "optimism",
  "Polygon":    "polygon",
  "Base":       "base",
  "Avalanche":  "avalanche",
  "Fantom":     "fantom",
  "Gnosis":     "gnosis",
  "Celo":       "celo",
  "Moonbeam":   "moonbeam",
  "kava":       "kava",
  "BNB":        "bsc",
  "BSC":        "bsc",
}

// Curve URL chain slugs (for the finance.curve.fi interface)
const CURVE_URL_CHAIN: Record<string, string> = {
  "Ethereum":   "ethereum",
  "Arbitrum":   "arbitrum",
  "Optimism":   "optimism",
  "Polygon":    "polygon",
  "Base":       "base",
  "Avalanche":  "avalanche",
  "Fantom":     "fantom",
  "Gnosis":     "xdai",
  "BNB":        "bsc",
  "BSC":        "bsc",
}

export type CurvePoolEntry = {
  address: string
  coins: string[]   // lowercased token addresses
}

/**
 * Fetch all Curve pools for a given chain from the Curve Finance API.
 * Returns a flat list of {address, coins[]} ready for matching.
 * Throws on network error so TanStack Query can retry.
 */
export async function fetchCurvePoolsForChain(chain: string): Promise<CurvePoolEntry[]> {
  const apiChain = CURVE_API_CHAIN[chain]
  if (!apiChain) return []

  const res = await fetch(`https://api.curve.finance/v1/getPools/all/${apiChain}`)
  if (!res.ok) throw new Error(`Curve API error: ${res.status}`)
  const json = await res.json() as {
    data: { poolData: Array<{ address: string; coins: Array<{ address: string }> }> }
  }

  return (json.data?.poolData ?? []).map((p) => ({
    address: p.address.toLowerCase(),
    coins: p.coins.map((c) => c.address.toLowerCase()),
  }))
}

/**
 * Given a list of Curve pool entries (from fetchCurvePoolsForChain),
 * find the pool whose coin set exactly matches underlyingTokens.
 * Returns the direct deposit URL, or null if not found.
 */
export function resolveCurvePoolUrl(
  curvePools: CurvePoolEntry[],
  chain: string,
  underlyingTokens: string[],
): string | null {
  if (!underlyingTokens.length) return null

  const want = underlyingTokens.map((t) => t.toLowerCase()).sort()
  const match = curvePools.find((p) => {
    const have = [...p.coins].sort()
    return have.length === want.length && have.every((c, i) => c === want[i])
  })

  if (!match) return null

  const urlChain = CURVE_URL_CHAIN[chain] ?? chain.toLowerCase()
  return `https://www.curve.finance/dex/${urlChain}/pools/${match.address}/deposit`
}

/**
 * Fallback URL when we can't resolve the specific pool address.
 */
export function curveChainPoolsUrl(chain: string): string {
  const urlChain = CURVE_URL_CHAIN[chain] ?? chain.toLowerCase()
  return `https://www.curve.finance/dex/${urlChain}/pools`
}
