// Blockchain API utilities — all free, no API key needed

export async function fetchEthBalance(address: string): Promise<number> {
  const res = await fetch("https://cloudflare-eth.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  })
  const data = (await res.json()) as { result?: string; error?: unknown }
  if (!data.result) throw new Error("Failed to fetch ETH balance")
  // Convert hex wei to ETH
  return parseInt(data.result, 16) / 1e18
}

export async function fetchBtcBalance(address: string): Promise<number> {
  const res = await fetch(`https://blockstream.info/api/address/${encodeURIComponent(address)}`)
  if (!res.ok) throw new Error("Failed to fetch BTC balance")
  const data = (await res.json()) as {
    chain_stats: { funded_txo_sum: number; spent_txo_sum: number }
  }
  const sats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum
  return sats / 1e8  // satoshi to BTC
}

export interface CryptoPrices {
  ethereum: number
  bitcoin: number
}

export async function fetchCryptoPrices(): Promise<CryptoPrices> {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
  )
  if (!res.ok) throw new Error("Failed to fetch prices")
  const data = (await res.json()) as {
    bitcoin: { usd: number }
    ethereum: { usd: number }
  }
  return {
    ethereum: data.ethereum.usd,
    bitcoin: data.bitcoin.usd,
  }
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

export function isValidBtcAddress(address: string): boolean {
  // Supports legacy (1...), P2SH (3...), bech32 (bc1...)
  return /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59})$/.test(address)
}

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars)}\u2026${address.slice(-chars)}`
}
