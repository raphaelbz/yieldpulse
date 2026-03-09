"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { ChainLogo } from "@/components/ui/custom/ChainLogo"
import { APYBadge } from "@/components/ui/custom/APYBadge"
import { formatTVL, formatProtocolName } from "@/lib/formatters"
import { usePools } from "@/hooks/usePools"
import type { Pool } from "@/types"
import { cn } from "@/lib/utils"

interface PoolSelectorProps {
  selectedIds: string[]
  onAdd: (poolId: string) => void
  disabled?: boolean
}

export function PoolSelector({ selectedIds, onAdd, disabled = false }: PoolSelectorProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { pools } = usePools()

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  const results: Pool[] = query.trim().length >= 2
    ? pools
        .filter((p) => {
          if (selectedIds.includes(p.pool)) return false
          if (p.outlier) return false
          const q = query.toLowerCase()
          return (
            p.symbol.toLowerCase().includes(q) ||
            p.project.toLowerCase().includes(q) ||
            p.chain.toLowerCase().includes(q)
          )
        })
        .sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
        .slice(0, 10)
    : []

  function handleSelect(pool: Pool) {
    onAdd(pool.pool)
    setQuery("")
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className={cn(
        "flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1c1c1e] px-3 py-2.5 transition-colors",
        isOpen && "border-green-500/50",
        disabled && "opacity-40 cursor-not-allowed"
      )}>
        <Search className="h-4 w-4 text-zinc-500 shrink-0" />
        <input
          type="text"
          placeholder={disabled ? "Max 4 pools reached" : "Add a pool to compare…"}
          value={query}
          disabled={disabled}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none disabled:cursor-not-allowed"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false) }}
            className="text-zinc-600 hover:text-zinc-400 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-30 rounded-xl border border-white/[0.08] bg-[#1c1c1e] shadow-2xl overflow-hidden">
          <div className="py-1">
            {results.map((pool) => (
              <button
                key={pool.pool}
                onClick={() => handleSelect(pool)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800 transition-colors text-left group"
              >
                {/* Protocol + chain */}
                <div className="relative shrink-0">
                  <ProtocolLogo project={pool.project} size={24} />
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <ChainLogo chain={pool.chain} size={12} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white group-hover:text-green-400 transition-colors truncate">
                      {pool.symbol}
                    </span>
                    <span className="text-xs text-zinc-600">·</span>
                    <span className="text-xs text-zinc-500 truncate">
                      {formatProtocolName(pool.project)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-600">{pool.chain}</span>
                    <span className="text-xs text-zinc-700">·</span>
                    <span className="text-xs text-zinc-600">TVL {formatTVL(pool.tvlUsd)}</span>
                  </div>
                </div>

                {/* APY */}
                <div className="shrink-0">
                  <APYBadge apy={pool.apy} size="sm" />
                </div>

                {/* Add icon */}
                <Plus className="h-3.5 w-3.5 text-zinc-600 group-hover:text-green-400 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-30 rounded-xl border border-white/[0.08] bg-[#1c1c1e] px-4 py-6 text-center shadow-2xl">
          <p className="text-sm text-zinc-500">No pools found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
