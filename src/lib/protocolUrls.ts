// ============================================================
// Direct deep-link URLs to specific pools on each protocol.
//
// Strategy per protocol type:
//  • V3-style AMMs (Uniswap V3, PancakeSwap V3, SushiSwap V3)
//      → compute pool address via CREATE2, link to pool explore page
//  • V2-style AMMs (Uniswap V2, SushiSwap V2, PancakeSwap V2)
//      → compute pool address via CREATE2 where factory is known,
//        else construct add-liquidity URL from token addresses
//  • Solidly forks (Velodrome, Aerodrome)
//      → add-liquidity URL with token addresses + stable flag
//  • Lending / yield protocols (Aave, Compound, Spark …)
//      → reserve-overview URL using underlyingTokens[0]
//  • Other protocols (Curve, Balancer, Beefy …)
//      → chain-specific pools page or protocol homepage
//  • Unknown → DefiLlama pool page (never dead link)
// ============================================================

import {
  getCreate2Address,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  encodePacked,
  getAddress,
} from "viem"
import type { Pool } from "@/types"

// ── Chain helpers ──────────────────────────────────────────────────────────

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

// Aave market name per chain
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

// PancakeSwap chain slug (their own naming)
const PCAKE_CHAIN: Record<string, string> = {
  "Ethereum":   "eth",
  "BSC":        "bnb",
  "BNB":        "bnb",
  "Arbitrum":   "arb",
  "Base":       "base",
  "zkSync Era": "zkSync",
  "Linea":      "linea",
}

function slug(chain: string): string {
  return CHAIN_SLUG[chain] ?? chain.toLowerCase().replace(/\s+/g, "-")
}

function cid(chain: string): number | null {
  return CHAIN_ID[chain] ?? null
}

/** True if str is a standard EVM address (0x + 40 hex chars) */
function isEvmAddr(s: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(s)
}

/**
 * Parse fee tier from poolMeta string.
 * "0.05%" → 500 bps, "0.3%" → 3000 bps, "1%" → 10000 bps, etc.
 */
function parseFee(poolMeta: string | null): number | null {
  if (!poolMeta) return null
  const m = poolMeta.match(/([\d.]+)\s*%/)
  if (!m) return null
  const bps = Math.round(parseFloat(m[1]) * 10000)
  return bps > 0 ? bps : null
}

// ── CREATE2 helpers ────────────────────────────────────────────────────────

/**
 * Uniswap V3–style CREATE2: salt = keccak256(abi.encode(token0, token1, fee)).
 * Used by Uniswap V3, PancakeSwap V3, SushiSwap V3, and most V3 forks.
 */
function computeV3PoolAddress(
  factory: string,
  initCodeHash: string,
  tokenA: string,
  tokenB: string,
  fee: number,
): string | null {
  try {
    const [t0, t1] = tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB] : [tokenB, tokenA]
    const salt = keccak256(
      encodeAbiParameters(
        parseAbiParameters("address, address, uint24"),
        [getAddress(t0), getAddress(t1), fee],
      ),
    )
    return getCreate2Address({ from: factory as `0x${string}`, salt, bytecodeHash: initCodeHash as `0x${string}` })
  } catch { return null }
}

/**
 * Uniswap V2–style CREATE2: salt = keccak256(encodePacked(token0, token1)).
 * Used by Uniswap V2, SushiSwap V2, PancakeSwap V2, and most V2 forks.
 */
function computeV2PoolAddress(
  factory: string,
  initCodeHash: string,
  tokenA: string,
  tokenB: string,
): string | null {
  try {
    const [t0, t1] = tokenA.toLowerCase() < tokenB.toLowerCase()
      ? [tokenA, tokenB] : [tokenB, tokenA]
    const salt = keccak256(encodePacked(["address", "address"], [getAddress(t0), getAddress(t1)]))
    return getCreate2Address({ from: factory as `0x${string}`, salt, bytecodeHash: initCodeHash as `0x${string}` })
  } catch { return null }
}

// ── Protocol-specific factory / init-code-hash tables ─────────────────────

// Uniswap V3 — same factory on all EVM chains
const UNI_V3_FACTORY   = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
const UNI_V3_INIT_HASH = "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54"

// Uniswap V2 — Ethereum mainnet only
const UNI_V2_FACTORY_ETH   = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
const UNI_V2_INIT_HASH_ETH = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f"

// SushiSwap V2 — same init hash everywhere, factory varies per chain
const SUSHI_V2_INIT_HASH = "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303"
const SUSHI_V2_FACTORY: Record<string, string> = {
  "Ethereum":  "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
  "Arbitrum":  "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "BSC":       "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "BNB":       "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "Polygon":   "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "Optimism":  "0xFbc12984689e5f15626Bad03Ad60160Fe98B303C",
  "Base":      "0x71524B4f93c58fcbF659783284E38825f0622859",
  "Avalanche": "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
  "Fantom":    "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "Gnosis":    "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
}

// SushiSwap V3 — same init hash as Uniswap V3 (same pool bytecode), factory varies
const SUSHI_V3_INIT_HASH = UNI_V3_INIT_HASH
const SUSHI_V3_FACTORY: Record<string, string> = {
  "Ethereum":  "0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F",
  "Arbitrum":  "0x1af415a1EbA07a4986a52B6f2e7dE7003D82231b",
  "Optimism":  "0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0",
  "Base":      "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  "BSC":       "0x126555dd55a39328F69400d6aE4F782Bd4C34ABb",
  "BNB":       "0x126555dd55a39328F69400d6aE4F782Bd4C34ABb",
  "Polygon":   "0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2",
  "Avalanche": "0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715",
  "Gnosis":    "0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf",
}

// PancakeSwap V2 (amm) — factory + init hash per chain
const PCAKE_V2_DATA: Record<string, { factory: string; initHash: string }> = {
  "BSC": { factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", initHash: "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5" },
  "BNB": { factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73", initHash: "0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5" },
  "Ethereum": { factory: "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362", initHash: "0x57224589c67f3f30a6b0d7a1b54cf3153ab84563bc609ef41dfb34f8b2974d2d" },
  "Arbitrum": { factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E", initHash: "0x57224589c67f3f30a6b0d7a1b54cf3153ab84563bc609ef41dfb34f8b2974d2d" },
  "Base": { factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E", initHash: "0x57224589c67f3f30a6b0d7a1b54cf3153ab84563bc609ef41dfb34f8b2974d2d" },
}

// PancakeSwap V3 (amm-v3) — same factory & hash on all chains
const PCAKE_V3_FACTORY   = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865"
const PCAKE_V3_INIT_HASH = "0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2"
// PancakeSwap V3 valid fee tiers (bps)
const PCAKE_V3_FEES = new Set([100, 500, 2500, 10000])

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Returns the best possible direct URL for depositing into a specific pool.
 * Prefers pool-address deep links, falls back to token-based add URLs,
 * then protocol pages, then DefiLlama as last resort.
 */
export function getPoolDirectUrl(pool: Pool): string {
  const { project, chain, pool: pid, underlyingTokens, poolMeta } = pool
  const chainSlug = slug(chain)
  const chainId   = cid(chain)
  const isAddr    = isEvmAddr(pid)
  const tok0      = underlyingTokens?.[0]
  const tok1      = underlyingTokens?.[1]

  // ── Uniswap V3 ──────────────────────────────────────────────────────────
  if (project === "uniswap-v3") {
    if (isAddr) return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      const validFee = fee && [100, 500, 3000, 10000].includes(fee) ? fee : null
      if (validFee) {
        const addr = computeV3PoolAddress(UNI_V3_FACTORY, UNI_V3_INIT_HASH, tok0, tok1, validFee)
        if (addr) return `https://app.uniswap.org/explore/pools/${chainSlug}/${addr}`
      }
    }
    return `https://app.uniswap.org/explore/pools/${chainSlug}`
  }

  // ── Uniswap V2 ──────────────────────────────────────────────────────────
  if (project === "uniswap-v2") {
    if (isAddr) return `https://app.uniswap.org/explore/pools/${chainSlug}/${pid}`
    if (tok0 && tok1 && chain === "Ethereum") {
      const addr = computeV2PoolAddress(UNI_V2_FACTORY_ETH, UNI_V2_INIT_HASH_ETH, tok0, tok1)
      if (addr) return `https://app.uniswap.org/explore/pools/ethereum/${addr}`
    }
    return `https://app.uniswap.org/explore/pools/${chainSlug}`
  }

  // ── Uniswap V4 ──────────────────────────────────────────────────────────
  // V4 uses hooks + different pool ID scheme; can't derive address easily
  if (project === "uniswap-v4") return `https://app.uniswap.org/explore/pools/${chainSlug}`

  // ── SushiSwap V2 (sushiswap) ────────────────────────────────────────────
  if (project === "sushiswap") {
    const factory = SUSHI_V2_FACTORY[chain]
    if (factory && tok0 && tok1) {
      const addr = computeV2PoolAddress(factory, SUSHI_V2_INIT_HASH, tok0, tok1)
      if (addr && chainId)
        return `https://www.sushi.com/${chainSlug}/pool/v2/${addr}/add`
    }
    if (tok0 && tok1 && chainId)
      return `https://www.sushi.com/${chainSlug}/pool/v2/add?fromCurrency=${tok0}&toCurrency=${tok1}`
    return `https://www.sushi.com/${chainSlug}/pool`
  }

  // ── SushiSwap V3 ────────────────────────────────────────────────────────
  if (project === "sushiswap-v3") {
    const factory = SUSHI_V3_FACTORY[chain]
    if (factory && tok0 && tok1) {
      const fee = parseFee(poolMeta)
      const validFee = fee && [100, 500, 3000, 10000].includes(fee) ? fee : null
      if (validFee) {
        const addr = computeV3PoolAddress(factory, SUSHI_V3_INIT_HASH, tok0, tok1, validFee)
        if (addr) return `https://www.sushi.com/${chainSlug}/pool/v3/${addr}/add`
      }
    }
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      const feeParam = fee ? `&feeAmount=${fee}` : ""
      return `https://www.sushi.com/${chainSlug}/pool/v3/add?fromCurrency=${tok0}&toCurrency=${tok1}${feeParam}`
    }
    return `https://www.sushi.com/${chainSlug}/pool`
  }

  // ── PancakeSwap V2 (pancakeswap-amm) ────────────────────────────────────
  if (project === "pancakeswap-amm") {
    const pcData = PCAKE_V2_DATA[chain]
    if (pcData && tok0 && tok1) {
      const addr = computeV2PoolAddress(pcData.factory, pcData.initHash, tok0, tok1)
      const pcChain = PCAKE_CHAIN[chain] ?? chainSlug
      if (addr) return `https://pancakeswap.finance/liquidity/${addr}?chain=${pcChain}`
    }
    if (tok0 && tok1) {
      const pcChain = PCAKE_CHAIN[chain] ?? chainSlug
      return `https://pancakeswap.finance/add/v2/${tok0}/${tok1}?chain=${pcChain}`
    }
    return "https://pancakeswap.finance/liquidity"
  }

  // ── PancakeSwap V3 (pancakeswap-amm-v3) ─────────────────────────────────
  if (project === "pancakeswap-amm-v3") {
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      const validFee = fee && PCAKE_V3_FEES.has(fee) ? fee : null
      if (validFee) {
        const addr = computeV3PoolAddress(PCAKE_V3_FACTORY, PCAKE_V3_INIT_HASH, tok0, tok1, validFee)
        const pcChain = PCAKE_CHAIN[chain] ?? chainSlug
        if (addr) return `https://pancakeswap.finance/liquidity/${addr}?chain=${pcChain}`
      }
      const pcChain = PCAKE_CHAIN[chain] ?? chainSlug
      const feeParam = fee ? `&feeAmount=${fee}` : ""
      return `https://pancakeswap.finance/add/${tok0}/${tok1}?chain=${pcChain}${feeParam}`
    }
    return "https://pancakeswap.finance/liquidity"
  }

  // ── Aave V3 ─────────────────────────────────────────────────────────────
  if (project === "aave-v3") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v3`
    return "https://app.aave.com/"
  }

  // ── Aave V2 ─────────────────────────────────────────────────────────────
  if (project === "aave-v2") {
    const market = AAVE_MARKET[chain]
    if (market && tok0)
      return `https://app.aave.com/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_${market}_v2`
    return "https://app.aave.com/"
  }

  // ── Compound V3 / V2 ────────────────────────────────────────────────────
  if (project === "compound-v3" || project === "compound-v2")
    return "https://app.compound.finance/"

  // ── Curve ───────────────────────────────────────────────────────────────
  // Resolved async via usePoolDirectUrl hook (Curve Finance API lookup).
  // This sync fallback is only used as initial render before the hook resolves.
  if (project === "curve" || project === "curve-dex")
    return `https://www.curve.finance/dex/${chainSlug}/pools`

  // ── Balancer V2 / V3 ────────────────────────────────────────────────────
  if (project === "balancer-v2" || project === "balancer-v3")
    return `https://balancer.fi/pools/${chainSlug}`

  // ── Pendle ──────────────────────────────────────────────────────────────
  if (project === "pendle") {
    if (isAddr && chainId) return `https://app.pendle.finance/trade/pools/${chainId}/${pid}`
    return "https://app.pendle.finance/trade/pools"
  }

  // ── Morpho / Morpho Blue ────────────────────────────────────────────────
  if (["morpho", "morpho-blue", "morpho-v1", "morpho-aave-v3", "morpho-aave-v2", "morpho-compound"].includes(project)) {
    if (isAddr) return `https://app.morpho.org/vault?vault=${pid}&network=${chainSlug}`
    return "https://app.morpho.org/"
  }

  // ── Spark ───────────────────────────────────────────────────────────────
  if (project === "spark") {
    if (tok0) return `https://app.spark.fi/reserve-overview/?underlyingAsset=${tok0}&marketName=proto_spark_v3`
    return "https://app.spark.fi/"
  }

  // ── Velodrome V2 ────────────────────────────────────────────────────────
  // poolMeta: "stable - 0.05%" or "volatile - 0.02%"
  if (project === "velodrome-v2") {
    if (isAddr) return `https://app.velodrome.finance/liquidity/manage?address=${pid}`
    if (tok0 && tok1) {
      const isStable = poolMeta?.toLowerCase().includes("stable")
      const typeParam = isStable !== undefined ? `&type=${isStable ? "0" : "-1"}` : ""
      return `https://app.velodrome.finance/add?token0=${tok0}&token1=${tok1}${typeParam}`
    }
    return "https://app.velodrome.finance/liquidity"
  }

  // ── Aerodrome V1 ────────────────────────────────────────────────────────
  // poolMeta is None — can't determine stable/volatile
  if (project === "aerodrome-v1") {
    if (isAddr) return `https://aerodrome.finance/liquidity/manage?address=${pid}`
    if (tok0 && tok1) return `https://aerodrome.finance/add?token0=${tok0}&token1=${tok1}`
    return "https://aerodrome.finance/liquidity"
  }

  // ── Aerodrome Slipstream (CL pools) ─────────────────────────────────────
  if (project === "aerodrome-slipstream" || project === "aerodrome") {
    if (isAddr) return `https://aerodrome.finance/liquidity/manage?address=${pid}`
    if (tok0 && tok1) return `https://aerodrome.finance/add?token0=${tok0}&token1=${tok1}`
    return "https://aerodrome.finance/liquidity"
  }

  // ── Camelot V3 (Algebra protocol) ───────────────────────────────────────
  if (project === "camelot-v3" || project === "camelot") {
    if (isAddr) return `https://app.camelot.exchange/pools/${pid}`
    if (tok0 && tok1) return `https://app.camelot.exchange/liquidity/?token0=${tok0}&token1=${tok1}`
    return "https://app.camelot.exchange/liquidity"
  }

  // ── GMX ─────────────────────────────────────────────────────────────────
  if (project === "gmx" || project === "gmx-v2" || project === "gmx-v2-perps")
    return "https://app.gmx.io/#/earn"

  // ── Lido ────────────────────────────────────────────────────────────────
  if (project === "lido") return "https://stake.lido.fi/"

  // ── Rocket Pool ─────────────────────────────────────────────────────────
  if (project === "rocket-pool") return "https://stake.rocketpool.net/"

  // ── Euler V1 / V2 ───────────────────────────────────────────────────────
  if (project === "euler" || project === "euler-v2") {
    if (isAddr) return `https://app.euler.finance/vault/${pid}?network=${chainSlug}`
    return "https://app.euler.finance/"
  }

  // ── Silo Finance ────────────────────────────────────────────────────────
  if (project === "silo-finance" || project === "silo-v2") {
    if (isAddr) return `https://app.silo.finance/${chainSlug}/${pid}`
    return "https://app.silo.finance/"
  }

  // ── Kamino ──────────────────────────────────────────────────────────────
  if (project === "kamino" || project === "kamino-liquidity") {
    if (isAddr) return `https://app.kamino.finance/liquidity/${pid}`
    return "https://app.kamino.finance/liquidity"
  }
  if (project === "kamino-lend") return "https://app.kamino.finance/lend"

  // ── Orca ────────────────────────────────────────────────────────────────
  if (project === "orca" || project === "orca-dex") {
    if (isAddr) return `https://www.orca.so/pools?q=${pid}`
    return "https://www.orca.so/pools"
  }

  // ── Raydium ─────────────────────────────────────────────────────────────
  if (project === "raydium" || project === "raydium-amm") return "https://raydium.io/liquidity/"

  // ── Meteora ─────────────────────────────────────────────────────────────
  if (project === "meteora") {
    if (isAddr) return `https://app.meteora.ag/pools/${pid}`
    return "https://app.meteora.ag/pools"
  }

  // ── Yearn Finance ───────────────────────────────────────────────────────
  if (project === "yearn-finance") {
    if (isAddr && chainId) return `https://yearn.fi/vaults/${chainId}/${pid}`
    return "https://yearn.fi/vaults"
  }

  // ── Convex ──────────────────────────────────────────────────────────────
  if (project === "convex-finance") return "https://www.convexfinance.com/stake"

  // ── Beefy ───────────────────────────────────────────────────────────────
  if (project === "beefy") return "https://app.beefy.com/"

  // ── Stargate ────────────────────────────────────────────────────────────
  if (project === "stargate" || project === "stargate-v2") return "https://stargate.finance/pool"

  // ── Hop ─────────────────────────────────────────────────────────────────
  if (project === "hop-protocol") return "https://app.hop.exchange/#/pool"

  // ── Across ──────────────────────────────────────────────────────────────
  if (project === "across-protocol") return "https://across.to/pool"

  // ── Synapse ─────────────────────────────────────────────────────────────
  if (project === "synapse") return "https://synapseprotocol.com/pools"

  // ── Wombat ──────────────────────────────────────────────────────────────
  if (project === "wombat-exchange") return "https://app.wombat.exchange/pool"

  // ── Aura ────────────────────────────────────────────────────────────────
  if (project === "aura") return "https://app.aura.finance/"

  // ── Gearbox ─────────────────────────────────────────────────────────────
  if (project === "gearbox") return "https://app.gearbox.fi/"

  // ── Fluid ───────────────────────────────────────────────────────────────
  if (project === "fluid" || project === "fluid-lending") return "https://fluid.instadapp.io/"

  // ── Ionic ───────────────────────────────────────────────────────────────
  if (project === "ionic-protocol") return "https://app.ionic.money/"

  // ── Seamless ────────────────────────────────────────────────────────────
  if (project === "seamless-protocol") return "https://app.seamlessprotocol.com/"

  // ── Radiant ─────────────────────────────────────────────────────────────
  if (project === "radiant-v2" || project === "radiant-v1") return "https://app.radiant.capital/"

  // ── Benqi ───────────────────────────────────────────────────────────────
  if (project === "benqi") return "https://app.benqi.fi/markets"

  // ── Venus ───────────────────────────────────────────────────────────────
  if (project === "venus") return "https://app.venus.io/markets"

  // ── MakerDAO / Sky ──────────────────────────────────────────────────────
  if (project === "makerdao" || project === "sky") return "https://app.sky.money/"

  // ── Frax ────────────────────────────────────────────────────────────────
  if (project === "frax" || project === "frax-ether" || project === "fraxlend")
    return "https://app.frax.finance/"

  // ── Notional ────────────────────────────────────────────────────────────
  if (project === "notional-v2" || project === "notional-v3") return "https://notional.finance/"

  // ── Extra Finance ───────────────────────────────────────────────────────
  if (project === "extra-finance") return "https://app.extrafi.io/farm"

  // ── Overnight ───────────────────────────────────────────────────────────
  if (project === "overnight-fi") return "https://overnight.fi/app"

  // ── Ondo ────────────────────────────────────────────────────────────────
  if (project === "ondo-finance") return "https://ondo.finance/"

  // ── Maple ───────────────────────────────────────────────────────────────
  if (project === "maple") return "https://app.maple.finance/"

  // ── Clearpool ───────────────────────────────────────────────────────────
  if (project === "clearpool") return "https://clearpool.finance/"

  // ── marginfi ────────────────────────────────────────────────────────────
  if (project === "marginfi") return "https://app.marginfi.com/lend"

  // ── Solend ──────────────────────────────────────────────────────────────
  if (project === "solend") return "https://solend.fi/dashboard"

  // ── Drift ───────────────────────────────────────────────────────────────
  if (project === "drift") return "https://app.drift.trade/vaults"

  // ── Ambient ─────────────────────────────────────────────────────────────
  if (project === "ambient-finance") return "https://ambient.finance/pool"

  // ── Dolomite ────────────────────────────────────────────────────────────
  if (project === "dolomite") return "https://app.dolomite.io/"

  // ── Gains Network ───────────────────────────────────────────────────────
  if (project === "gains-network") return "https://gains.trade/vaults"

  // ── Equilibria ──────────────────────────────────────────────────────────
  if (project === "equilibria") return "https://equilibria.fi/pool"

  // ── Ramses ──────────────────────────────────────────────────────────────
  if (project === "ramses-v2" || project === "ramses") {
    if (isAddr) return `https://www.ramses.exchange/pool/${pid}`
    if (tok0 && tok1) return `https://www.ramses.exchange/liquidity?token0=${tok0}&token1=${tok1}`
    return "https://www.ramses.exchange/liquidity"
  }

  // ── Thena ───────────────────────────────────────────────────────────────
  if (project === "thena") {
    if (isAddr) return `https://www.thena.fi/liquidity/${pid}`
    if (tok0 && tok1) return `https://www.thena.fi/liquidity?token0=${tok0}&token1=${tok1}`
    return "https://www.thena.fi/liquidity"
  }

  // ── Trader Joe ──────────────────────────────────────────────────────────
  if (project === "trader-joe" || project === "trader-joe-v2") {
    if (tok0 && tok1) return `https://traderjoexyz.com/${chainSlug}/pool/${tok0}/${tok1}`
    return "https://traderjoexyz.com/pool"
  }

  // ── KyberSwap ───────────────────────────────────────────────────────────
  if (project === "kyberswap" || project === "kyberswap-elastic") {
    if (tok0 && tok1) {
      const fee = parseFee(poolMeta)
      return fee
        ? `https://kyberswap.com/${chainSlug}/elastic/add/${tok0}/${tok1}/${fee}`
        : `https://kyberswap.com/${chainSlug}/elastic/add/${tok0}/${tok1}`
    }
    return "https://kyberswap.com/pools"
  }

  // ── Lynex ───────────────────────────────────────────────────────────────
  if (project === "lynex") return "https://app.lynex.fi/liquidity"

  // ── Pearl ───────────────────────────────────────────────────────────────
  if (project === "pearl") return "https://www.pearl.exchange/liquidity"

  // ── Default: DefiLlama pool page ────────────────────────────────────────
  return `https://defillama.com/yields/pool/${pid}`
}
