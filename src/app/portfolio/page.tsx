import { PortfolioClient } from "@/components/portfolio/PortfolioClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Track your ETH and BTC wallet balances on YieldPulse.",
}

export default function PortfolioPage() {
  return <PortfolioClient />
}
