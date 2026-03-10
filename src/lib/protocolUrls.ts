// ============================================================
// Direct deep-link URLs to specific pools on each protocol.
// Strategy per protocol:
//   1. If pool.pool is an EVM address (0x + 40 hex) → use it directly
//   2. If pool.pool is a Balancer 32-byte poolId     → extract address from first 20 bytes
//   3. If pool.pool is a UUID                        → build URL from underlyingTokens + poolMeta (fee)
//   4. Fallback                                      → protocol homepage, then DefiLlama
// ============================================================

import type { Pool } from "@/types"

const CHAIN_SLUG: Record<string, string> = {
  "Ethereum":    "ethereum",
  "Arbitrum":    "arbitrum",
  "Optimism":    "optimism",
  "Polygon":     "polygon",
  "Base":        "base",
  "Avalanche":   "avalanche",
  "BNB":         "bnb",
  "BSC":         "bnb",
  "Fantom":      "fantom",
  "Gnosis":      "gnosis",
  "Celo":        "celo",
  "Moonbeam":    "moonbeam",
  "Moonriver":   "moonriver",
  "Kava":        "kava",
  "Metis":       "metis",
  "zkSync Era":  "zksync-era",
  "Linea":       "linea",
  "Scroll":      "scroll",
  "Mantle":      "mantle",
  "Blast":       "blast",
  "Mode":        "mode",
  "Manta":       "manta",
  "Cronos":      "cronos",
}

const CHAIN_ID: Record<string, number> = {
  "Ethereum":   1,
  "Arbitrum":   42161,
  "Optimism":   10,
  "Polygon":    137,
  "Base":       8453,
  "Avalanche":  43114,
  "BNB":        56,
  "BSC":        56,
  "Fantom":     250,
  "Gnosis":     100,
  "Celo":       42220,
  "Metis":      1088,
  "zkSync Era": 324,
  "Linea":      59144,
  "Scroll":     534352,
  "Mantle":     5000,
  "Blast":      81457,
  "Mode":       34443,
  "Moonbeam":   1284,
  "Moonriver":  1285,
}

const AAVE_MARKET: Record<string, string> = {
  "Ethereum":   "mainnet",
  "Arbitrum":   "arbitrum",
  "Optimism":   "optimism",
  "Polygon":    "polygon",
  "Avalanche":  "avalanche",
  "Base":       "base",
  "BNB":        "bnb",
  "Gnosis":     "gnosis",
  "Scroll":     "scroll",
  "Metis":      "metis",
  "zkSync Era": "zksync",
}

function slug(chain: string): string {
  return CHAIN_SLUG[chain] ?? chain.toLowerCase().replace(/\s+/g, "-")
}

function cid(chain: string): number | null {
  return CHAIN_ID[chain] ?? null
}

/** Standard EVM address: 0x + 40 hex chars */
function isEvmAddr(s: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(s)
}

/** Balancer 32-byte poolId: 0x + 64 hex chars */
function isBalancerPoolId(s: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(s)
}

/** Extract the pool contract address from a Balancer 32-byte poolId */
function balancerAddress(poolId: string): string {
  return poolId.slice(0, 42)
}

/**
 * Parse fee tier from poolMeta (e.g. "0.05%" → 500, "0.3%" → 3000, "1%" → 10000).
 * Returns null if not parseable.
 */
function parseFee(poolMeta: string | null): number | null {
  if (!poolMeta) return null
  const m = poolMeta.match(/([\d.]+)\s*%/)
  if (!m) return null
  const bps = Math.round(parseFloat(m[1]) * 10000)
  return bps > 0 ? bps : null
}

/**
 * Returns the best possible direct URL for depositing / providing liquidity
 * into a specific pool. Never returns an empty string.
 */
export function getPoolDirectUrl(pool: Pool): string {
  const { project, chain, pool: pid, underlyingTokens, poolMeta } = pool
  const chainSlug = slug(chain)
  const chainId   = cid(chain)
  const isAddr    = isEvmAddr(pid)
  const tok0      = underlyingTokens?.[0]
  const tok1      = underlyingTokens?.[1]

  // ── Uniswap V3 ─────────────────────────────────────────────────────
  // pid can be a contract address OR a UUID.
  // With address → explore/pools deep link.
  // With tokens + fee → add liquidity page (arrives on the exact pool).
  if (project === "uniswap-v3") {
    if (isAddr) return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      const base = `https://app.uniswap.org/add/${tok0}/${tok1}`
      return fee ? `${base}/${fee}?chain=${chainSlug}` : `${base}?chain=${chainSlug}`
    }
    return `https://app.uniswap.org/explore/pools/${chainSlug}`
  }

  // ── Uniswap V2 ─────────────────────────────────────────────────────
  if (project === "uniswap-v2") {
    if (isAddr) return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`
    if (tok0 && tok1) return `https://app.uniswap.org/add/v2/${tok0}/${tok1}?chain=${chainSlug}`
    return `https://app.uniswap.org/explore/pools/${chainSlug}`
  }

  // ── Aave V3 ────────────────────────────────────────────────────────
  if (project === "aave-v3") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v3`
    return "https://app.aave.com/"
  }

  // ── Aave V2 ────────────────────────────────────────────────────────
  if (project === "aave-v2") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v2`
    return "https://app.aave.com/"
  }

  // ── Compound V3 / V2 ───────────────────────────────────────────────
  if (project === "compound-v3" || project === "compound-v2")
    return "https://app.compound.finance/"

  // ── Curve ──────────────────────────────────────────────────────────
  // pid is usually the pool contract address
  if (project === "curve" || project === "curve-dex") {
    if (isAddr) return `https://curve.fi/#/${chainSlug}/pools/${pid}/deposit`
    return `https://curve.fi/#/${chainSlug}/pools`
  }

  // ── Balancer V2 ────────────────────────────────────────────────────
  // Balancer poolIds are 32-byte hex (0x + 64 chars); address = first 20 bytes
  if (project === "balancer" || project === "balancer-v2") {
    if (isAddr) return `https://balancer.fi/pools/${chainSlug}/v2/${pid}`
    if (isBalancerPoolId(pid)) return `https://balancer.fi/pools/${chainSlug}/v2/${balancerAddress(pid)}`
    return "https://balancer.fi/"
  }

  // ── Pendle ─────────────────────────────────────────────────────────
  if (project === "pendle") {
    if (isAddr && chainId) return `https://app.pendle.finance/trade/pools/${chainId}/${pid}`
    return "https://app.pendle.finance/trade/pools"
  }

  // ── Morpho / Morpho Blue ───────────────────────────────────────────
  if (["morpho", "morpho-blue", "morpho-aave-v3", "morpho-aave-v2", "morpho-compound"].includes(project)) {
    if (isAddr) return `https://app.morpho.org/vault?vault=${pid}&network=${chainSlug}`
    return "https://app.morpho.org/"
  }

  // ── Spark ──────────────────────────────────────────────────────────
  if (project === "spark") {
    if (tok0) return `https://app.spark.fi/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_spark_v3`
    return "https://app.spark.fi/"
  }

  // ── GMX ────────────────────────────────────────────────────────────
  if (project === "gmx" || project === "gmx-v2") return "https://app.gmx.io/#/earn"

  // ── Velodrome ──────────────────────────────────────────────────────
  if (project === "velodrome-v2" || project === "velodrome") {
    if (isAddr) return `https://app.velodrome.finance/liquidity/manage?address=${pid}`
    return "https://app.velodrome.finance/liquidity"
  }

  // ── Aerodrome ──────────────────────────────────────────────────────
  if (project === "aerodrome") {
    if (isAddr) return `https://aerodrome.finance/liquidity/manage?address=${pid}`
    return "https://aerodrome.finance/liquidity"
  }

  // ── Camelot ────────────────────────────────────────────────────────
  if (project === "camelot" || project === "camelot-v3") {
    if (isAddr) return `https://app.camelot.exchange/pools/${pid}`
    return "https://app.camelot.exchange/liquidity"
  }

  // ── SushiSwap ──────────────────────────────────────────────────────
  if (project === "sushiswap") {
    if (isAddr && chainId) return `https://app.sushi.com/pool/${chainId}:${pid}`
    if (tok0 && tok1) return `https://app.sushi.com/add/${tok0}/${tok1}?chainId=${chainId ?? ""}`
    return "https://app.sushi.com/pool"
  }

  // ── PancakeSwap ────────────────────────────────────────────────────
  if (project === "pancakeswap" || project === "pancakeswap-v3") {
    if (isAddr) return `https://pancakeswap.finance/liquidity/${pid}`
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      return fee
        ? `https://pancakeswap.finance/add/${tok0}/${tok1}?feeAmount=${fee}`
        : `https://pancakeswap.finance/add/${tok0}/${tok1}`
    }
    return "https://pancakeswap.finance/liquidity"
  }

  // ── Ramses ─────────────────────────────────────────────────────────
  if (project === "ramses-v2" || project === "ramses") {
    if (isAddr) return `https://www.ramses.exchange/pool/${pid}`
    return "https://www.ramses.exchange/liquidity"
  }

  // ── Thena ──────────────────────────────────────────────────────────
  if (project === "thena") {
    if (isAddr) return `https://www.thena.fi/liquidity/${pid}`
    return "https://www.thena.fi/liquidity"
  }

  // ── Trader Joe ─────────────────────────────────────────────────────
  if (project === "trader-joe" || project === "trader-joe-v2") {
    if (isAddr) return `https://traderjoexyz.com/${chainSlug}/pool/v21/${pid}`
    if (tok0 && tok1) return `https://traderjoexyz.com/${chainSlug}/pool/${tok0}/${tok1}`
    return "https://traderjoexyz.com/pool"
  }

  // ── KyberSwap ──────────────────────────────────────────────────────
  if (project === "kyberswap" || project === "kyberswap-elastic") {
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      return fee
        ? `https://kyberswap.com/${chainSlug}/elastic/add/${tok0}/${tok1}/${fee}`
        : `https://kyberswap.com/${chainSlug}/elastic/add/${tok0}/${tok1}`
    }
    return "https://kyberswap.com/pools"
  }

  // ── Euler ──────────────────────────────────────────────────────────
  if (project === "euler" || project === "euler-v2") {
    if (isAddr) return `https://app.euler.finance/vault/${pid}?network=${chainSlug}`
    return "https://app.euler.finance/"
  }

  // ── Silo ───────────────────────────────────────────────────────────
  if (project === "silo-finance" || project === "silo-v2") {
    if (isAddr) return `https://app.silo.finance/${chainSlug}/${pid}`
    return "https://app.silo.finance/"
  }

  // ── Kamino ─────────────────────────────────────────────────────────
  if (project === "kamino") {
    if (isAddr) return `https://app.kamino.finance/liquidity/${pid}`
    return "https://app.kamino.finance/"
  }
  if (project === "kamino-lend") return "https://app.kamino.finance/lend"

  // ── Orca ───────────────────────────────────────────────────────────
  if (project === "orca") {
    if (isAddr) return `https://www.orca.so/pools?q=${pid}`
    return "https://www.orca.so/pools"
  }

  // ── Meteora ────────────────────────────────────────────────────────
  if (project === "meteora") {
    if (isAddr) return `https://app.meteora.ag/pools/${pid}`
    return "https://app.meteora.ag/pools"
  }

  // ── Yearn ──────────────────────────────────────────────────────────
  if (project === "yearn-finance") {
    if (isAddr && chainId) return `https://yearn.fi/vaults/${chainId}/${pid}`
    return "https://yearn.fi/vaults"
  }

  // ── Convex ─────────────────────────────────────────────────────────
  if (project === "convex-finance") return "https://www.convexfinance.com/stake"

  // ── Lido ───────────────────────────────────────────────────────────
  if (project === "lido") return "https://stake.lido.fi/"

  // ── Rocket Pool ────────────────────────────────────────────────────
  if (project === "rocket-pool") return "https://stake.rocketpool.net/"

  // ── Stargate ───────────────────────────────────────────────────────
  if (project === "stargate" || project === "stargate-v2")
    return "https://stargate.finance/pool"

  // ── Hop ────────────────────────────────────────────────────────────
  if (project === "hop-protocol") return "https://app.hop.exchange/#/pool"

  // ── Across ─────────────────────────────────────────────────────────
  if (project === "across-protocol") return "https://across.to/pool"

  // ── Synapse ────────────────────────────────────────────────────────
  if (project === "synapse") return "https://synapseprotocol.com/pools"

  // ── Wombat ─────────────────────────────────────────────────────────
  if (project === "wombat-exchange") return "https://app.wombat.exchange/pool"

  // ── Aura ───────────────────────────────────────────────────────────
  if (project === "aura") return "https://app.aura.finance/"

  // ── Beefy ──────────────────────────────────────────────────────────
  if (project === "beefy") return "https://app.beefy.com/"

  // ── Gearbox ────────────────────────────────────────────────────────
  if (project === "gearbox") return "https://app.gearbox.fi/"

  // ── Fluid ──────────────────────────────────────────────────────────
  if (project === "fluid") return "https://fluid.instadapp.io/"

  // ── Ionic ──────────────────────────────────────────────────────────
  if (project === "ionic-protocol") return "https://app.ionic.money/"

  // ── Seamless ───────────────────────────────────────────────────────
  if (project === "seamless-protocol") return "https://app.seamlessprotocol.com/"

  // ── Radiant ────────────────────────────────────────────────────────
  if (project === "radiant-v2" || project === "radiant-v1") return "https://app.radiant.capital/"

  // ── Benqi ──────────────────────────────────────────────────────────
  if (project === "benqi") return "https://app.benqi.fi/markets"

  // ── Venus ──────────────────────────────────────────────────────────
  if (project === "venus") return "https://app.venus.io/markets"

  // ── MakerDAO / Sky ─────────────────────────────────────────────────
  if (project === "makerdao" || project === "sky") return "https://app.sky.money/"

  // ── Frax ───────────────────────────────────────────────────────────
  if (project === "frax" || project === "frax-ether" || project === "fraxlend")
    return "https://app.frax.finance/"

  // ── Notional ───────────────────────────────────────────────────────
  if (project === "notional-v2" || project === "notional-v3") return "https://notional.finance/"

  // ── Extra Finance ──────────────────────────────────────────────────
  if (project === "extra-finance") return "https://app.extrafi.io/farm"

  // ── Overnight ──────────────────────────────────────────────────────
  if (project === "overnight-fi") return "https://overnight.fi/app"

  // ── Ondo ───────────────────────────────────────────────────────────
  if (project === "ondo-finance") return "https://ondo.finance/"

  // ── Maple ──────────────────────────────────────────────────────────
  if (project === "maple") return "https://app.maple.finance/"

  // ── Clearpool ──────────────────────────────────────────────────────
  if (project === "clearpool") return "https://clearpool.finance/"

  // ── marginfi ───────────────────────────────────────────────────────
  if (project === "marginfi") return "https://app.marginfi.com/lend"

  // ── Solend ─────────────────────────────────────────────────────────
  if (project === "solend") return "https://solend.fi/dashboard"

  // ── Drift ──────────────────────────────────────────────────────────
  if (project === "drift") return "https://app.drift.trade/vaults"

  // ── Ambient ────────────────────────────────────────────────────────
  if (project === "ambient-finance") return "https://ambient.finance/pool"

  // ── Dolomite ───────────────────────────────────────────────────────
  if (project === "dolomite") return "https://app.dolomite.io/"

  // ── Gains Network ──────────────────────────────────────────────────
  if (project === "gains-network") return "https://gains.trade/vaults"

  // ── Equilibria ─────────────────────────────────────────────────────
  if (project === "equilibria") return "https://equilibria.fi/pool"

  // ── Fenix ──────────────────────────────────────────────────────────
  if (project === "fenix") {
    if (isAddr) return `https://www.fenixfinance.io/pool/${pid}`
    return "https://www.fenixfinance.io/liquidity"
  }

  // ── Lynex ──────────────────────────────────────────────────────────
  if (project === "lynex") return "https://app.lynex.fi/liquidity"

  // ── Pearl ──────────────────────────────────────────────────────────
  if (project === "pearl") return "https://www.pearl.exchange/liquidity"

  // ── Default: DefiLlama pool page ───────────────────────────────────
  return `https://defillama.com/yields/pool/${pid}`
}
