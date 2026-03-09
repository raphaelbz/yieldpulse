"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAlerts } from "@/hooks/useAlerts"
import { usePools } from "@/hooks/usePools"
import type { AlertType } from "@/types"
import { cn } from "@/lib/utils"

const ALERT_TYPE_OPTIONS: { value: AlertType; label: string; description: string }[] = [
  {
    value: "apy_above",
    label: "APY rises above",
    description: "Alert when APY exceeds your threshold",
  },
  {
    value: "apy_below",
    label: "APY drops below",
    description: "Alert when APY falls under your threshold",
  },
  {
    value: "apy_change",
    label: "APY changes by",
    description: "Alert when 24h APY change exceeds threshold",
  },
]

async function requestNotifPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission === "default") {
    await Notification.requestPermission()
  }
}

export function AlertForm() {
  const { createAlert } = useAlerts()
  const { pools } = usePools()

  const [type, setType] = useState<AlertType>("apy_above")
  const [threshold, setThreshold] = useState("")
  const [symbol, setSymbol] = useState("")
  const [chain, setChain] = useState("")
  const [stablecoinOnly, setStablecoinOnly] = useState(false)
  const [poolSearch, setPoolSearch] = useState("")
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Unique chains + symbols from pool data for autocomplete
  const chains = [...new Set(pools.map((p) => p.chain))].sort()

  const matchedPool = selectedPoolId
    ? pools.find((p) => p.pool === selectedPoolId)
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const thresholdNum = parseFloat(threshold)
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      toast.error("Enter a valid threshold percentage")
      return
    }

    createAlert({
      type,
      poolId: selectedPoolId,
      chain: chain || null,
      symbol: symbol.trim() || null,
      threshold: thresholdNum,
      stablecoinOnly,
    })

    // Request notification permission on first alert
    void requestNotifPermission()

    toast.success("Alert created", {
      description: `You'll be notified when the condition is met`,
    })

    // Reset
    setThreshold("")
    setSymbol("")
    setChain("")
    setSelectedPoolId(null)
    setPoolSearch("")
    setIsExpanded(false)
  }

  const typeConfig = ALERT_TYPE_OPTIONS.find((o) => o.value === type)

  // Pool search results
  const poolResults = poolSearch.trim().length >= 2
    ? pools
        .filter((p) => {
          const q = poolSearch.toLowerCase()
          return (
            p.symbol.toLowerCase().includes(q) ||
            p.project.toLowerCase().includes(q)
          )
        })
        .slice(0, 8)
    : []

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#1c1c1e]">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4 text-green-400" />
          Create new alert
        </span>
        <span className={cn(
          "text-xs text-zinc-500 transition-transform duration-200",
          isExpanded && "rotate-180"
        )}>▼</span>
      </button>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="border-t border-zinc-800 px-5 pb-5 pt-4 space-y-4">

          {/* Alert type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Alert type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ALERT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    type === opt.value
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-[#2c2c2e]/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                >
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[11px] mt-0.5 opacity-70">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              {typeConfig?.label ?? "Threshold"} (%)
            </label>
            <div className="relative max-w-xs">
              <Input
                type="number"
                min={0}
                max={10000}
                step={0.1}
                placeholder="e.g. 10"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 pr-8 font-mono"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">%</span>
            </div>
          </div>

          {/* Scope: specific pool OR filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Specific pool search */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Specific pool (optional)
              </label>
              {matchedPool ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2">
                  <span className="text-xs text-green-400 font-medium flex-1">
                    {matchedPool.symbol} · {matchedPool.project} · {matchedPool.chain}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedPoolId(null); setPoolSearch("") }}
                    className="text-zinc-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    placeholder="Search symbol or protocol…"
                    value={poolSearch}
                    onChange={(e) => setPoolSearch(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                  />
                  {poolResults.length > 0 && (
                    <div className="absolute top-full mt-1 left-0 right-0 z-20 rounded-lg border border-white/[0.08] bg-[#1c1c1e] shadow-xl overflow-hidden">
                      {poolResults.map((p) => (
                        <button
                          key={p.pool}
                          type="button"
                          onClick={() => {
                            setSelectedPoolId(p.pool)
                            setPoolSearch("")
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <span className="font-medium text-white">{p.symbol}</span>
                          <span className="text-zinc-500">{p.project} · {p.chain}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-[11px] text-zinc-600">Leave empty to alert on any matching pool</p>
            </div>

            {/* Filters: token + chain */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Token symbol filter</label>
                <Input
                  placeholder="e.g. USDC"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  disabled={!!selectedPoolId}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 disabled:opacity-40 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Chain filter</label>
                <Select value={chain} onValueChange={(v) => setChain(v ?? "")} disabled={!!selectedPoolId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-300 disabled:opacity-40">
                    <SelectValue placeholder="Any chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 max-h-52">
                    <SelectItem value="" className="text-zinc-300 text-xs">Any chain</SelectItem>
                    {chains.slice(0, 25).map((c) => (
                      <SelectItem key={c} value={c} className="text-zinc-300 text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stablecoin toggle */}
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={stablecoinOnly}
              onChange={(e) => setStablecoinOnly(e.target.checked)}
              disabled={!!selectedPoolId}
              className="rounded border-zinc-700 bg-zinc-800 accent-green-500"
            />
            <span className="text-xs text-zinc-400">Stablecoin pools only</span>
          </label>

          {/* Submit */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-zinc-600 flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Browser notification + in-app toast when triggered
            </p>
            <Button
              type="submit"
              size="sm"
              className="h-8 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs border-transparent"
            >
              Create alert
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
