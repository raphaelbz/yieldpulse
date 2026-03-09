"use client"

import { useMemo } from "react"
import { SlidersHorizontal, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { useAppStore } from "@/store/useAppStore"
import { getUniqueChains, getUniqueProtocols, countByChain } from "@/lib/filters"
import { formatProtocolName } from "@/lib/formatters"
import { MIN_TVL_OPTIONS } from "@/lib/constants"
import type { MinTvlOption, Pool } from "@/types"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  allPools: Pool[]
  filteredCount: number
  totalCount: number
  isFetching: boolean
  onRefetch: () => void
}

export function FilterBar({
  allPools,
  filteredCount,
  totalCount,
  isFetching,
  onRefetch,
}: FilterBarProps) {
  const filters = useAppStore((s) => s.filters)
  const setFilter = useAppStore((s) => s.setFilter)
  const resetFilters = useAppStore((s) => s.resetFilters)

  const { chains, protocols } = useMemo(() => ({
    chains: getUniqueChains(allPools),
    protocols: getUniqueProtocols(allPools),
  }), [allPools])

  const chainCounts = useMemo(() => countByChain(allPools), [allPools])

  const activeFilterCount = [
    filters.chains.length > 0,
    filters.protocols.length > 0,
    filters.stablecoinOnly,
    filters.singleExposureOnly,
    filters.apyMin > 0,
    filters.apyMax < 300,
    filters.minTvl !== 1_000_000,
    !filters.excludeOutliers,
  ].filter(Boolean).length

  function toggleChain(chain: string) {
    const next = filters.chains.includes(chain)
      ? filters.chains.filter((c) => c !== chain)
      : [...filters.chains, chain]
    setFilter("chains", next)
  }

  function toggleProtocol(protocol: string) {
    const next = filters.protocols.includes(protocol)
      ? filters.protocols.filter((p) => p !== protocol)
      : [...filters.protocols, protocol]
    setFilter("protocols", next)
  }

  // Trigger button base classes (mimic Button outline/sm without asChild)
  const triggerBase =
    "inline-flex shrink-0 items-center justify-center rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-150 h-8 px-3 text-xs gap-1.5 border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.07] hover:text-white cursor-pointer select-none focus-visible:outline-none"

  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* ── Chain filter ── */}
      <Popover>
        <PopoverTrigger
          className={cn(
            triggerBase,
            filters.chains.length > 0 && "border-green-500/[0.3] text-green-400 bg-green-500/[0.06]"
          )}
        >
          Chain
          {filters.chains.length > 0 && (
            <Badge className="ml-1 h-4 px-1.5 bg-green-500/20 text-green-400 border-0 text-[10px]">
              {filters.chains.length}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 border-white/[0.09] bg-[#000000]/95 backdrop-blur-xl" align="start">
          <p className="text-[11px] font-medium text-zinc-600 mb-2 uppercase tracking-widest">Filter by Chain</p>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {chains.slice(0, 30).map((chain) => (
              <button
                key={chain}
                onClick={() => toggleChain(chain)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-sm transition-all duration-150 cursor-pointer",
                  filters.chains.includes(chain)
                    ? "bg-green-500/[0.08] text-green-400"
                    : "text-zinc-300 hover:bg-white/[0.05]"
                )}
              >
                <span className="flex items-center gap-2">
                  <ChainLogo chain={chain} size={16} />
                  {chain}
                </span>
                <span className="text-xs text-zinc-500 font-mono">{chainCounts[chain] ?? 0}</span>
              </button>
            ))}
          </div>
          {filters.chains.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs text-zinc-500 hover:text-white"
              onClick={() => setFilter("chains", [])}
            >
              Clear
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {/* ── Protocol filter ── */}
      <Popover>
        <PopoverTrigger
          className={cn(
            triggerBase,
            filters.protocols.length > 0 && "border-green-500/[0.3] text-green-400 bg-green-500/[0.06]"
          )}
        >
          Protocol
          {filters.protocols.length > 0 && (
            <Badge className="ml-1 h-4 px-1.5 bg-green-500/20 text-green-400 border-0 text-[10px]">
              {filters.protocols.length}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 border-white/[0.09] bg-[#000000]/95 backdrop-blur-xl" align="start">
          <p className="text-[11px] font-medium text-zinc-600 mb-2 uppercase tracking-widest">Filter by Protocol</p>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {protocols.slice(0, 50).map((protocol) => (
              <button
                key={protocol}
                onClick={() => toggleProtocol(protocol)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm transition-all duration-150 text-left cursor-pointer",
                  filters.protocols.includes(protocol)
                    ? "bg-green-500/[0.08] text-green-400"
                    : "text-zinc-300 hover:bg-white/[0.05]"
                )}
              >
                {formatProtocolName(protocol)}
              </button>
            ))}
          </div>
          {filters.protocols.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 h-7 text-xs text-zinc-500 hover:text-white"
              onClick={() => setFilter("protocols", [])}
            >
              Clear
            </Button>
          )}
        </PopoverContent>
      </Popover>

      {/* ── Min TVL ── */}
      <Select
        value={String(filters.minTvl)}
        onValueChange={(v) => setFilter("minTvl", Number(v) as MinTvlOption)}
      >
        <SelectTrigger className="h-8 w-32 border-white/[0.08] bg-white/[0.04] text-zinc-400 text-xs rounded-xl hover:bg-white/[0.07] transition-all">
          <SelectValue placeholder="Min TVL" />
        </SelectTrigger>
        <SelectContent className="border-white/[0.09] bg-[#000000]/95 backdrop-blur-xl">
          {MIN_TVL_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
              className="text-zinc-300 text-xs focus:bg-white/[0.06] focus:text-white"
            >
              TVL ≥ {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* ── APY Range ── */}
      <Popover>
        <PopoverTrigger
          className={cn(
            triggerBase,
            (filters.apyMin > 0 || filters.apyMax < 300) && "border-green-500/[0.3] text-green-400 bg-green-500/[0.06]"
          )}
        >
          APY{" "}
          {filters.apyMin > 0 || filters.apyMax < 300
            ? `${filters.apyMin}%–${filters.apyMax < 300 ? filters.apyMax + "%" : "∞"}`
            : "Range"}
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 border-white/[0.09] bg-[#000000]/95 backdrop-blur-xl" align="start">
          <p className="text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wide">APY Range</p>
          <div className="flex justify-between text-xs text-zinc-400 mb-3">
            <span>Min: <span className="font-mono text-white">{filters.apyMin}%</span></span>
            <span>Max: <span className="font-mono text-white">{filters.apyMax >= 300 ? "∞" : filters.apyMax + "%"}</span></span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[filters.apyMin, Math.min(filters.apyMax, 100)]}
            onValueChange={(rawValue) => {
              const values = Array.isArray(rawValue) ? rawValue : [rawValue as number]
              const [min, max] = [values[0] ?? 0, values[1] ?? 100]
              setFilter("apyMin", min)
              setFilter("apyMax", max === 100 ? 300 : max)
            }}
            className="w-full"
          />
        </PopoverContent>
      </Popover>

      {/* ── Toggles ── */}
      <label className="inline-flex items-center gap-1.5 border border-white/[0.08] rounded-xl px-3 h-8 bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-150 cursor-pointer">
        <Switch
          checked={filters.stablecoinOnly}
          onCheckedChange={(v) => setFilter("stablecoinOnly", v)}
          className="h-4 w-7 data-[state=checked]:bg-green-500"
        />
        <span className="text-xs text-zinc-500 select-none">Stables</span>
      </label>

      <label className="inline-flex items-center gap-1.5 border border-white/[0.08] rounded-xl px-3 h-8 bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-150 cursor-pointer">
        <Switch
          checked={filters.singleExposureOnly}
          onCheckedChange={(v) => setFilter("singleExposureOnly", v)}
          className="h-4 w-7 data-[state=checked]:bg-green-500"
        />
        <span className="text-xs text-zinc-500 select-none">No IL</span>
      </label>

      <label className="inline-flex items-center gap-1.5 border border-white/[0.08] rounded-xl px-3 h-8 bg-white/[0.04] hover:bg-white/[0.07] transition-all duration-150 cursor-pointer">
        <Switch
          checked={filters.excludeOutliers}
          onCheckedChange={(v) => setFilter("excludeOutliers", v)}
          className="h-4 w-7 data-[state=checked]:bg-green-500"
        />
        <span className="text-xs text-zinc-500 select-none">No outliers</span>
      </label>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Pool count */}
      <span className="text-xs text-zinc-500 font-mono tabular-nums">
        <span className="text-zinc-300 font-semibold">{filteredCount.toLocaleString()}</span>
        <span className="mx-1">/</span>
        {totalCount.toLocaleString()} pools
      </span>

      {/* Refresh */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefetch}
        disabled={isFetching}
        className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
        title="Refresh"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
      </Button>

      {/* Reset */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 text-xs text-zinc-500 hover:text-white px-2"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Reset ({activeFilterCount})
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-8 border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.07] text-xs rounded-xl px-3"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
        More
      </Button>
    </div>
  )
}
