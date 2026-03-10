// ============================================================
// Direct deep-link URLs to specific pools on each protocol.
// Takes the full Pool object to build precise URLs using
// pool address, chain, and underlying token addresses.
// Falls back to DefiLlama when no deep link is possible.
// ============================================================

import type { Pool } from "@/types"

// Chain name → slug used in most app URLs
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

// Chain name → numeric chain ID (EIP-155)
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

// Aave market name suffix per chain (used in reserve-overview URLs)
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

function s(chain: string): string {
  return CHAIN_SLUG[chain] ?? chain.toLowerCase().replace(/\s+/g, "-")
}

function cid(chain: string): number | null {
  return CHAIN_ID[chain] ?? null
}

/** Returns true if str looks like an EVM contract address */
function isAddr(str: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(str)
}

/**
 * Returns the best possible direct URL for depositing into a specific pool.
 * Attempts a deep link using pool address / chain / token addresses.
 * Falls back to the DefiLlama pool page when no direct URL can be built.
 */
export function getPoolDirectUrl(pool: Pool): string {
  const { project, chain, pool: pid, underlyingTokens } = pool
  const chainSlug = s(chain)
  const chainId  = cid(chain)
  const addr     = isAddr(pid)
  const tok0     = underlyingTokens?.[0]

  // ── Uniswap V3 / V2 ────────────────────────────────────────────────
  if (project === "uniswap-v3" && addr)
    return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`
  if (project === "uniswap-v2" && addr)
    return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`

  // ── Aave V3 / V2 ───────────────────────────────────────────────────
  if (project === "aave-v3") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v3`
    return "https://app.aave.com/"
  }
  if (project === "aave-v2") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v2`
    return "https://app.aave.com/"
  }

  // ── Compound V3 / V2 ───────────────────────────────────────────────
  if (project === "compound-v3") return "https://app.compound.finance/"
  if (project === "compound-v2") return "https://app.compound.finance/"

  // ── Curve ──────────────────────────────────────────────────────────
  if (project === "curve" || project === "curve-dex") {
    if (addr) return `https://curve.fi/#/${chainSlug}/pools/${pid}/deposit`
    return `https://curve.fi/#/${chainSlug}/pools`
  }

  // ── Balancer V2 ────────────────────────────────────────────────────
  if (project === "balancer" || project === "balancer-v2") {
    if (addr) return `https://balancer.fi/pools/${chainSlug}/v2/${pid}`
    return "https://balancer.fi/"
  }

  // ── Pendle ─────────────────────────────────────────────────────────
  if (project === "pendle") {
    if (addr && chainId) return `https://app.pendle.finance/trade/pools/${chainId}/${pid}`
    return "https://app.pendle.finance/trade/pools"
  }

  // ── Morpho / Morpho Blue ────────────────────────────────────────────
  if (project === "morpho" || project === "morpho-blue" || project === "morpho-aave-v3" || project === "morpho-aave-v2" || project === "morpho-compound") {
    if (addr) return `https://app.morpho.org/vault?vault=${pid}&network=${chainSlug}`
    return "https://app.morpho.org/"
  }

  // ── Spark ──────────────────────────────────────────────────────────
  if (project === "spark") {
    if (tok0) return `https://app.spark.fi/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_spark_v3`
    return "https://app.spark.fi/"
  }

  // ── GMX V1 / V2 ────────────────────────────────────────────────────
  if (project === "gmx" || project === "gmx-v2") return "https://app.gmx.io/#/earn"

  // ── Velodrome ──────────────────────────────────────────────────────
  if (project === "velodrome-v2" || project === "velodrome") {
    if (addr) return `https://app.velodrome.finance/liquidity/manage?address=${pid}`
    return "https://app.velodrome.finance/liquidity"
  }

  // ── Aerodrome ──────────────────────────────────────────────────────
  if (project === "aerodrome") {
    if (addr) return `https://aerodrome.finance/liquidity/manage?address=${pid}`
    return "https://aerodrome.finance/liquidity"
  }

  // ── Camelot V2 / V3 ────────────────────────────────────────────────
  if (project === "camelot" || project === "camelot-v3") {
    if (addr) return `https://app.camelot.exchange/pools/${pid}`
    return "https://app.camelot.exchange/liquidity"
  }

  // ── SushiSwap ──────────────────────────────────────────────────────
  if (project === "sushiswap") {
    if (addr && chainId) return `https://app.sushi.com/pool/${chainId}:${pid}`
    return "https://app.sushi.com/pool"
  }

  // ── PancakeSwap V2 / V3 ────────────────────────────────────────────
  if (project === "pancakeswap" || project === "pancakeswap-v3") {
    if (addr) return `https://pancakeswap.finance/liquidity/${pid}`
    return "https://pancakeswap.finance/liquidity"
  }

  // ── Ramses ─────────────────────────────────────────────────────────
  if (project === "ramses-v2" || project === "ramses") {
    if (addr) return `https://www.ramses.exchange/pool/${pid}`
    return "https://www.ramses.exchange/liquidity"
  }

  // ── Thena ──────────────────────────────────────────────────────────
  if (project === "thena") {
    if (addr) return `https://www.thena.fi/liquidity/${pid}`
    return "https://www.thena.fi/liquidity"
  }

  // ── Trader Joe V1 / V2 ─────────────────────────────────────────────
  if (project === "trader-joe" || project === "trader-joe-v2") {
    if (addr) return `https://traderjoexyz.com/${chainSlug}/pool/v21/${pid}`
    return "https://traderjoexyz.com/pool"
  }

  // ── KyberSwap ──────────────────────────────────────────────────────
  if (project === "kyberswap" || project === "kyberswap-elastic") {
    if (addr) return `https://kyberswap.com/${chainSlug}/elastic/remove/${pid}`
    return "https://kyberswap.com/pools"
  }

  // ── Euler V1 / V2 ──────────────────────────────────────────────────
  if (project === "euler" || project === "euler-v2") {
    if (addr) return `https://app.euler.finance/vault/${pid}?network=${chainSlug}`
    return "https://app.euler.finance/"
  }

  // ── Silo Finance ───────────────────────────────────────────────────
  if (project === "silo-finance" || project === "silo-v2") {
    if (addr) return `https://app.silo.finance/${chainSlug}/${pid}`
    return "https://app.silo.finance/"
  }

  // ── Kamino (Solana) ────────────────────────────────────────────────
  if (project === "kamino") {
    if (addr) return `https://app.kamino.finance/liquidity/${pid}`
    return "https://app.kamino.finance/"
  }
  if (project === "kamino-lend") return "https://app.kamino.finance/lend"

  // ── Orca (Solana) ──────────────────────────────────────────────────
  if (project === "orca") {
    if (addr) return `https://www.orca.so/pools?q=${pid}`
    return "https://www.orca.so/pools"
  }

  // ── Meteora (Solana) ───────────────────────────────────────────────
  if (project === "meteora") {
    if (addr) return `https://app.meteora.ag/pools/${pid}`
    return "https://app.meteora.ag/pools"
  }

  // ── Yearn Finance ──────────────────────────────────────────────────
  if (project === "yearn-finance") {
    if (addr && chainId) return `https://yearn.fi/vaults/${chainId}/${pid}`
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
  if (project === "radiant-v2" || project === "radiant-v1")
    return "https://app.radiant.capital/"

  // ── Benqi ──────────────────────────────────────────────────────────
  if (project === "benqi") return "https://app.benqi.fi/markets"

  // ── Venus ──────────────────────────────────────────────────────────
  if (project === "venus") return "https://app.venus.io/markets"

  // ── MakerDAO / Sky ─────────────────────────────────────────────────
  if (project === "makerdao" || project === "sky") return "https://app.sky.money/"

  // ── Frax ───────────────────────────────────────────────────────────
  if (project === "frax" || project === "frax-ether" || project === "fraxlend")
    return "https://app.frax.finance/"

  // ── Pendle (already handled above) — notional ──────────────────────
  if (project === "notional-v2" || project === "notional-v3")
    return "https://notional.finance/"

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

  // ── Equilibria ─────────────────────────────────────────────────────
  if (project === "equilibria") return "https://equilibria.fi/pool"

  // ── Gains / gTrade ─────────────────────────────────────────────────
  if (project === "gains-network") return "https://gains.trade/vaults"

  // ── Fenix ──────────────────────────────────────────────────────────
  if (project === "fenix") {
    if (addr) return `https://www.fenixfinance.io/pool/${pid}`
    return "https://www.fenixfinance.io/liquidity"
  }

  // ── Lynex ──────────────────────────────────────────────────────────
  if (project === "lynex") return "https://app.lynex.fi/liquidity"

  // ── Retro ──────────────────────────────────────────────────────────
  if (project === "retro") {
    if (addr) return `https://retro.finance/pool/${pid}`
    return "https://retro.finance/liquidity"
  }

  // ── Pearl ──────────────────────────────────────────────────────────
  if (project === "pearl") return "https://www.pearl.exchange/liquidity"

  // ── Default: DefiLlama fallback ────────────────────────────────────
  return `https://defillama.com/yields/pool/${pid}`
}
