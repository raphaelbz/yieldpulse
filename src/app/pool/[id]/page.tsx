import type { Metadata } from "next"
import { PoolDetailClient } from "@/components/pool-detail/PoolDetailClient"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      next: { revalidate: 300 }, // 5-min ISR cache — shared with client fetch
    })
    const json = (await res.json()) as {
      status: string
      data: Array<{
        pool: string
        symbol: string
        project: string
        chain: string
        apy: number | null
        tvlUsd: number
      }>
    }
    const pool = json.data?.find((p) => p.pool === id)

    if (pool) {
      const apyStr = pool.apy != null ? `${pool.apy.toFixed(2)}% APY` : "APY data"
      const tvlStr = pool.tvlUsd >= 1e9
        ? `$${(pool.tvlUsd / 1e9).toFixed(1)}B TVL`
        : pool.tvlUsd >= 1e6
        ? `$${(pool.tvlUsd / 1e6).toFixed(1)}M TVL`
        : `$${(pool.tvlUsd / 1e3).toFixed(0)}K TVL`
      const title = `${pool.symbol} on ${pool.project} (${pool.chain})`
      const description = `${pool.symbol} pool: ${apyStr}, ${tvlStr}. View historical APY charts, risk score, and similar pools on YieldPulse.`

      return {
        title,
        description,
        openGraph: {
          title: `${pool.symbol} — ${apyStr}`,
          description: `${pool.project} on ${pool.chain} · ${tvlStr}`,
        },
      }
    }
  } catch {
    // Fall through to generic metadata
  }

  return {
    title: "Pool Detail",
    description: "View APY history, risk score, and metrics for this DeFi yield pool on YieldPulse.",
  }
}

export default async function PoolDetailPage({ params }: Props) {
  const { id } = await params
  return <PoolDetailClient poolId={id} />
}
