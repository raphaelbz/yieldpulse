"use client"

import { useQuery } from "@tanstack/react-query"
import { useAppStore } from "@/store/useAppStore"
import { fetchEthBalance, fetchBtcBalance, fetchCryptoPrices } from "@/lib/blockchain"
import type { WalletBalance } from "@/types"

export function useWalletBalances() {
  const wallets = useAppStore((s) => s.wallets)

  return useQuery({
    queryKey: ["walletBalances", wallets.map((w) => w.id).join(",")],
    queryFn: async (): Promise<WalletBalance[]> => {
      const prices = await fetchCryptoPrices()
      const results: WalletBalance[] = await Promise.all(
        wallets.map(async (wallet): Promise<WalletBalance> => {
          try {
            const nativeBalance =
              wallet.type === "evm"
                ? await fetchEthBalance(wallet.address)
                : await fetchBtcBalance(wallet.address)
            const price = wallet.type === "evm" ? prices.ethereum : prices.bitcoin
            return {
              walletId: wallet.id,
              nativeBalance,
              usdValue: nativeBalance * price,
              lastFetchedAt: Date.now(),
              error: null,
            }
          } catch (e) {
            return {
              walletId: wallet.id,
              nativeBalance: 0,
              usdValue: null,
              lastFetchedAt: Date.now(),
              error: e instanceof Error ? e.message : "Failed to fetch balance",
            }
          }
        })
      )
      return results
    },
    enabled: wallets.length > 0,
    staleTime: 2 * 60 * 1000,  // 2 minutes
    refetchInterval: 2 * 60 * 1000,
  })
}
