import { WatchlistClient } from "@/components/watchlist/WatchlistClient"

export const metadata = {
  title: "Watchlist",
  description: "Track and monitor your saved DeFi yield pools. Get instant APY change insights for your watchlisted positions.",
}

export default function WatchlistPage() {
  return <WatchlistClient />
}
