"use client"

import { useState, useMemo } from "react"
import { Plus, Wallet, Bitcoin, Copy, Trash2, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useAppStore } from "@/store/useAppStore"
import { useWalletBalances } from "@/hooks/useWalletBalances"
import { isValidEthAddress, isValidBtcAddress, truncateAddress } from "@/lib/blockchain"
import { generateId } from "@/lib/utils"
import type { TrackedWallet, WalletType } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Format a number as USD
function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

// Format balance with appropriate decimals
function formatBalance(value: number, type: WalletType): string {
  const symbol = type === "evm" ? "ETH" : "BTC"
  const decimals = type === "evm" ? 4 : 6
  return `${value.toFixed(decimals)} ${symbol}`
}

// Explorer URL
function explorerUrl(address: string, type: WalletType): string {
  if (type === "btc") return `https://blockstream.info/address/${address}`
  return `https://etherscan.io/address/${address}`
}

export function PortfolioClient() {
  const wallets = useAppStore((s) => s.wallets)
  const addWallet = useAppStore((s) => s.addWallet)
  const removeWallet = useAppStore((s) => s.removeWallet)
  const { data: balances, isLoading, refetch, isRefetching } = useWalletBalances()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Aggregate totals
  const totals = useMemo(() => {
    if (!balances) return { ethUsd: 0, btcUsd: 0, totalUsd: 0 }
    return balances.reduce(
      (acc, b) => {
        const wallet = wallets.find((w) => w.id === b.walletId)
        if (!wallet || b.usdValue === null) return acc
        if (wallet.type === "evm") acc.ethUsd += b.usdValue
        else acc.btcUsd += b.usdValue
        acc.totalUsd += b.usdValue
        return acc
      },
      { ethUsd: 0, btcUsd: 0, totalUsd: 0 }
    )
  }, [balances, wallets])

  function getBalance(walletId: string) {
    return balances?.find((b) => b.walletId === walletId) ?? null
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track your ETH and BTC wallet balances</p>
        </div>
        <div className="flex items-center gap-2">
          {wallets.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || isLoading}
              className="h-8 text-xs text-zinc-500 hover:text-white"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", (isRefetching || isLoading) && "animate-spin")} />
              Refresh
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="h-8 text-xs bg-green-500 hover:bg-green-400 text-black font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Wallet
          </Button>
        </div>
      </div>

      {/* Summary cards — only show when wallets exist */}
      {wallets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Value", value: totals.totalUsd, accent: "green" },
            { label: "ETH Holdings", value: totals.ethUsd, accent: "blue" },
            { label: "BTC Holdings", value: totals.btcUsd, accent: "amber" },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.07] bg-[#1c1c1e] p-4"
            >
              <p className="text-xs text-zinc-500 mb-1">{label}</p>
              {isLoading ? (
                <Skeleton className="h-6 w-20 bg-zinc-800" />
              ) : (
                <p className={cn(
                  "text-lg font-mono font-semibold",
                  accent === "green" ? "text-green-400" :
                  accent === "blue" ? "text-blue-400" :
                  "text-amber-400"
                )}>
                  {formatUSD(value)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wallet list */}
      {wallets.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] flex flex-col items-center justify-center py-20 text-center">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
            <Wallet className="h-5 w-5 text-zinc-600" />
          </div>
          <p className="text-zinc-300 font-medium mb-1">No wallets tracked</p>
          <p className="text-zinc-600 text-sm mb-5">Add an ETH or BTC address to get started</p>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="h-8 text-xs bg-green-500 hover:bg-green-400 text-black font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add your first wallet
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-[#000000] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_130px_130px_40px] gap-4 px-4 py-3 border-b border-white/[0.05] bg-[#1c1c1e]/50">
            {["Wallet", "Balance", "USD Value", ""].map((h) => (
              <span key={h} className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {wallets.map((wallet) => {
            const bal = getBalance(wallet.id)
            return (
              <div
                key={wallet.id}
                className={cn(
                  "grid grid-cols-[1fr_130px_130px_40px] gap-4 px-4 py-3.5 items-center",
                  "border-b border-white/[0.04] last:border-0",
                  "hover:bg-white/[0.02] transition-colors duration-150 group"
                )}
              >
                {/* Wallet identity */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                    wallet.type === "evm"
                      ? "bg-blue-500/10 border-blue-500/20"
                      : "bg-amber-500/10 border-amber-500/20"
                  )}>
                    {wallet.type === "evm"
                      ? <Wallet className="h-4 w-4 text-blue-400" />
                      : <Bitcoin className="h-4 w-4 text-amber-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">
                      {wallet.label || truncateAddress(wallet.address)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-zinc-600 font-mono truncate">
                        {truncateAddress(wallet.address)}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(wallet.address)
                          toast.success("Address copied")
                        }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-400 transition-all"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <a
                        href={explorerUrl(wallet.address, wallet.type)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-zinc-400 transition-all"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                  ) : bal?.error ? (
                    <span className="flex items-center gap-1 text-xs text-red-400">
                      <AlertCircle className="h-3 w-3" /> Error
                    </span>
                  ) : (
                    <span className="text-sm font-mono tabular-nums text-zinc-300">
                      {bal ? formatBalance(bal.nativeBalance, wallet.type) : "\u2014"}
                    </span>
                  )}
                </div>

                {/* USD Value */}
                <div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-16 bg-zinc-800" />
                  ) : bal?.usdValue !== null && bal?.usdValue !== undefined ? (
                    <span className="text-sm font-mono tabular-nums text-green-400">
                      {formatUSD(bal.usdValue)}
                    </span>
                  ) : (
                    <span className="text-sm text-zinc-600">\u2014</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      removeWallet(wallet.id)
                      toast.success("Wallet removed")
                    }}
                    className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Disclaimer */}
      {wallets.length > 0 && (
        <p className="text-[11px] text-zinc-700 text-center">
          Balances reflect native ETH/BTC only. Stored locally in your browser. Data from Cloudflare ETH RPC &amp; Blockstream.
        </p>
      )}

      <AddWalletDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onAdd={addWallet} />
    </main>
  )
}

// ---- Add Wallet Dialog ----

interface AddWalletDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (wallet: TrackedWallet) => void
}

function AddWalletDialog({ open, onClose, onAdd }: AddWalletDialogProps) {
  const [address, setAddress] = useState("")
  const [label, setLabel] = useState("")
  const wallets = useAppStore((s) => s.wallets)

  const detectedType: WalletType | null = isValidEthAddress(address)
    ? "evm"
    : isValidBtcAddress(address)
    ? "btc"
    : null

  const isDuplicate = wallets.some((w) => w.address.toLowerCase() === address.toLowerCase())
  const isValid = detectedType !== null && !isDuplicate

  function handleAdd() {
    if (!isValid || !detectedType) return
    onAdd({
      id: generateId(),
      address,
      type: detectedType,
      label: label.trim(),
      addedAt: new Date().toISOString(),
    })
    toast.success("Wallet added")
    setAddress("")
    setLabel("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#1c1c1e] border border-white/[0.09] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add Wallet</DialogTitle>
          <DialogDescription className="text-zinc-500 text-sm">
            Track an ETH/EVM or BTC address. Balances are read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Wallet Address</label>
            <Input
              placeholder="0x\u2026 or bc1\u2026 or 1\u2026"
              value={address}
              onChange={(e) => setAddress(e.target.value.trim())}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 font-mono text-xs h-10"
            />
            {address.length > 10 && (
              <p className={cn("text-xs mt-1.5", isValid ? "text-green-400" : "text-red-400")}>
                {isDuplicate
                  ? "Already tracking this address"
                  : detectedType === "evm"
                  ? "Valid Ethereum/EVM address"
                  : detectedType === "btc"
                  ? "Valid Bitcoin address"
                  : "Invalid address format"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Label (optional)</label>
            <Input
              placeholder="e.g. Main wallet, Cold storage\u2026"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 text-sm h-10"
              maxLength={32}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!isValid}
              className="h-9 bg-green-500 hover:bg-green-400 text-black font-semibold disabled:opacity-40"
            >
              Add Wallet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
