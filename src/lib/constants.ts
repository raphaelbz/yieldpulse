// ============================================================
// YieldPulse — Constants & Mappings
// ============================================================

import type { ChainMap, MinTvlOption } from "@/types"

export const DEFILLAMA_ICONS_BASE = "https://icons.llamao.fi/icons"

// Chain configuration with brand colors
export const CHAINS: ChainMap = {
  Ethereum: { color: "#627EEA", logo: "ethereum" },
  Arbitrum: { color: "#28A0F0", logo: "arbitrum" },
  Base: { color: "#0052FF", logo: "base" },
  Optimism: { color: "#FF0420", logo: "optimism" },
  Polygon: { color: "#8247E5", logo: "polygon" },
  BSC: { color: "#F0B90B", logo: "bsc" },
  Avalanche: { color: "#E84142", logo: "avax" },
  Solana: { color: "#9945FF", logo: "solana" },
  Fantom: { color: "#1969FF", logo: "fantom" },
  Gnosis: { color: "#3E6957", logo: "gnosis" },
  Linea: { color: "#61DFFF", logo: "linea" },
  Scroll: { color: "#FFDBB0", logo: "scroll" },
  zkSync: { color: "#4E529A", logo: "zksync-era" },
  Blast: { color: "#FCFC03", logo: "blast" },
  Mantle: { color: "#000000", logo: "mantle" },
  Celo: { color: "#35D07F", logo: "celo" },
  Moonbeam: { color: "#5DD2A3", logo: "moonbeam" },
}

// Featured protocols to highlight in the UI
export const FEATURED_PROTOCOLS = [
  "aave-v3",
  "morpho",
  "pendle",
  "ethena",
  "compound-v3",
  "spark",
  "fluid",
  "usual",
  "maker",
  "lido",
  "rocket-pool",
  "yearn-finance",
  "convex-finance",
  "curve-dex",
  "uniswap-v3",
  "aerodrome",
  "velodrome",
]

// Min TVL filter options
export const MIN_TVL_OPTIONS: { label: string; value: MinTvlOption }[] = [
  { label: "$10K", value: 10_000 },
  { label: "$100K", value: 100_000 },
  { label: "$1M", value: 1_000_000 },
  { label: "$10M", value: 10_000_000 },
  { label: "$100M", value: 100_000_000 },
]

// Default filter values
export const DEFAULT_MIN_TVL: MinTvlOption = 1_000_000

// TanStack Query keys
export const QUERY_KEYS = {
  pools: ["pools"] as const,
  poolChart: (poolId: string) => ["poolChart", poolId] as const,
}

// Stale time configuration (milliseconds)
export const STALE_TIME = {
  pools: 5 * 60 * 1000,      // 5 minutes
  poolChart: 10 * 60 * 1000, // 10 minutes
}

// Risk score thresholds
export const RISK_THRESHOLDS = {
  low: 30,
  medium: 60,
}

// LocalStorage keys
export const LS_KEYS = {
  watchlist: "yieldpulse:watchlist",
  alerts: "yieldpulse:alerts",
  alertHistory: "yieldpulse:alertHistory",
  filters: "yieldpulse:filters",
  wallets: "yieldpulse:wallets",
}
