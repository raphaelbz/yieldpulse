"use client"

import Link from "next/link"
import { X, GitCompare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { ProtocolLogo } from "@/components/ui/custom/ProtocolLogo"
import { useAppStore, selectCompare } from "@/store/useAppStore"
import { usePools } from "@/hooks/usePools"
import { cn } from "@/lib/utils"

export function CompareBar() {
  const compareSelection = useAppStore(selectCompare)
  const removeFromCompare = useAppStore((s) => s.removeFromCompare)
  const clearCompare = useAppStore((s) => s.clearCompare)
  const { pools } = usePools()

  if (compareSelection.length < 2) return null

  const selectedPools = compareSelection
    .map((id) => pools.find((p) => p.pool === id))
    .filter(Boolean) as (typeof pools)[number][]

  const compareUrl = `/compare?pools=${compareSelection.join(",")}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-700 bg-zinc-900/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 animate-slide-up">
      <GitCompare className="h-4 w-4 text-green-400 shrink-0" />
      <span className="text-sm font-medium text-zinc-300 shrink-0">
        Compare ({compareSelection.length}/4)
      </span>

      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {selectedPools.map((pool) => (
          <div
            key={pool.pool}
            className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white shrink-0"
          >
            <ProtocolLogo project={pool.project} size={14} />
            <span className="font-medium">{pool.symbol}</span>
            <span className="text-zinc-500">{pool.chain}</span>
            <button
              onClick={() => removeFromCompare(pool.pool)}
              className="ml-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCompare}
          className="h-8 text-xs text-zinc-500 hover:text-white"
        >
          Clear
        </Button>
        {/* Use Link with buttonVariants since Button doesn't support asChild in base-ui */}
        <Link
          href={compareUrl}
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-8 bg-green-500 hover:bg-green-400 text-black font-semibold text-xs border-transparent"
          )}
        >
          Compare →
        </Link>
      </div>
    </div>
  )
}
