// ============================================================
// YieldPulse — Formatting Utilities
// All financial data formatting functions
// ============================================================

/**
 * Format APY value as percentage string.
 * Returns "—" for null/undefined.
 */
export function formatAPY(apy: number | null | undefined): string {
  if (apy === null || apy === undefined) return "—"
  return `${apy.toFixed(2)}%`
}

/**
 * Format APY change with +/- sign and arrow.
 */
export function formatAPYChange(change: number | null | undefined): {
  text: string
  isPositive: boolean
  isNeutral: boolean
} {
  if (change === null || change === undefined) {
    return { text: "—", isPositive: false, isNeutral: true }
  }
  const isPositive = change >= 0
  const arrow = isPositive ? "▲" : "▼"
  const sign = isPositive ? "+" : ""
  return {
    text: `${arrow} ${sign}${change.toFixed(2)}%`,
    isPositive,
    isNeutral: false,
  }
}

/**
 * Format TVL in abbreviated form: $1.2B, $450M, $12.5K
 */
export function formatTVL(tvl: number | null | undefined): string {
  if (tvl === null || tvl === undefined) return "—"
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`
  return `$${tvl.toFixed(0)}`
}

/**
 * Format large numbers (volume, etc.)
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format a date string as relative time or locale string.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format timestamp as "last updated X min ago"
 */
export function formatLastUpdated(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return "just now"
  if (diffMin === 1) return "1 min ago"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

/**
 * Format impermanent loss as percentage.
 */
export function formatIL(il: number | null | undefined): string {
  if (il === null || il === undefined) return "—"
  return `${Math.abs(il).toFixed(2)}%`
}

/**
 * Capitalize first letter of each word.
 */
export function formatProtocolName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
