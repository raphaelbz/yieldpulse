import { CompareClient } from "@/components/compare/CompareClient"

export const metadata = {
  title: "Compare Pools",
  description: "Compare up to 4 DeFi yield pools side-by-side. Overlaid APY charts, risk scores, and full metric breakdown.",
}

interface Props {
  searchParams: Promise<{ pools?: string }>
}

export default async function ComparePage({ searchParams }: Props) {
  const { pools } = await searchParams
  const poolIds = pools
    ? pools.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4)
    : []

  return <CompareClient initialPoolIds={poolIds} />
}
