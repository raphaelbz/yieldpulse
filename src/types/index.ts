// ============================================================
// YieldPulse — TypeScript Types (strict, no `any`)
// Source: DefiLlama Yields API https://yields.llama.fi
// ============================================================

// ------ API Response Types ------

export interface Pool {
  pool: string               // UUID — unique pool identifier
  chain: string              // "Ethereum", "Arbitrum", "Base", etc.
  project: string            // "aave-v3", "morpho", "pendle", etc.
  symbol: string             // "USDC", "ETH", "USDC-USDT", etc.
  tvlUsd: number             // Total Value Locked in USD
  apy: number | null         // Total APY (base + reward)
  apyBase: number | null     // Base APY (from protocol mechanics)
  apyReward: number | null   // Reward APY (token incentives)
  apyBase7d: number | null   // 7-day average base APY
  apyMean30d: number | null  // 30-day mean APY
  rewardTokens: string[]     // Reward token addresses
  underlyingTokens: string[] // Underlying token addresses
  il7d: number | null        // 7-day impermanent loss
  ilRisk: "no" | "yes"       // Impermanent loss risk flag
  exposure: "single" | "multi" // Asset exposure type
  poolMeta: string | null    // Extra info ("Lending", "Vault", etc.)
  stablecoin: boolean        // Whether pool involves stablecoins
  volumeUsd1d: number | null
  volumeUsd7d: number | null
  apyPct1D: number | null    // 1-day APY change %
  apyPct7D: number | null    // 7-day APY change %
  apyPct30D: number | null   // 30-day APY change %
  mu: number | null          // Expected value (for outlier detection)
  sigma: number | null       // Standard deviation
  count: number | null       // Number of data points
  outlier: boolean           // Statistical outlier flag
  predictedClass: string | null  // ML-predicted pool class
  binnedConfidence: number | null
}

export interface ChartDataPoint {
  timestamp: string    // ISO date string
  tvlUsd: number
  apy: number | null
  apyBase: number | null
  apyReward: number | null
  il7d: number | null
  apyBase7d: number | null
}

export interface PoolsApiResponse {
  status: "success" | "error"
  data: Pool[]
}

export interface ChartApiResponse {
  status: "success" | "error"
  data: ChartDataPoint[]
}

// ------ Risk Scoring ------

export type RiskLevel = "low" | "medium" | "high"

export interface RiskBreakdown {
  tvlFactor: number        // 0-25
  apySustainability: number // 0-25
  rewardDependency: number  // 0-20
  ilRisk: number            // 0-15
  apyVolatility: number     // 0-15
}

export interface RiskScore {
  score: number
  level: RiskLevel
  breakdown: RiskBreakdown
}

// ------ Filter State ------

export type SortField =
  | "apy"
  | "apyBase"
  | "apyReward"
  | "tvlUsd"
  | "apyPct1D"
  | "apyPct7D"
  | "apyPct30D"
  | "apyMean30d"

export type SortDirection = "asc" | "desc"

export type MinTvlOption = 10_000 | 100_000 | 1_000_000 | 10_000_000 | 100_000_000

export interface FilterState {
  chains: string[]
  protocols: string[]
  tokenSearch: string
  stablecoinOnly: boolean
  singleExposureOnly: boolean
  apyMin: number
  apyMax: number
  minTvl: MinTvlOption
  excludeOutliers: boolean
  search: string
}

export type ViewMode = "table" | "card"

// ------ Watchlist ------

export type WatchlistEntry = string  // pool UUID

// ------ Alerts ------

export type AlertType = "apy_above" | "apy_below" | "apy_change"

export interface Alert {
  id: string
  type: AlertType
  poolId: string | null      // null = "any pool matching criteria"
  chain: string | null
  symbol: string | null
  threshold: number          // APY % value
  stablecoinOnly: boolean
  createdAt: string          // ISO date
  enabled: boolean
}

export interface AlertHistoryEntry {
  id: string
  alertId: string
  poolId: string
  poolSymbol: string
  chain: string
  project: string
  triggeredAt: string        // ISO date
  apyAtTrigger: number
  message: string
}

// ------ Compare ------

export type CompareSelection = string[]  // up to 4 pool UUIDs

// ------ Chain / Protocol Config ------

export interface ChainConfig {
  color: string
  logo: string
}

export interface ChainMap {
  [chainName: string]: ChainConfig
}

// ------ Formatting ------

export type TimeRange = "7d" | "30d" | "90d" | "1y"

// ------ Wallet Portfolio ------

export type WalletType = "evm" | "btc"

export interface TrackedWallet {
  id: string           // generateId()
  address: string
  type: WalletType
  label: string        // user-provided nickname
  addedAt: string      // ISO date
}

export interface WalletBalance {
  walletId: string
  nativeBalance: number    // ETH in ether or BTC in BTC (not satoshi/wei)
  usdValue: number | null
  lastFetchedAt: number    // timestamp
  error: string | null
}
