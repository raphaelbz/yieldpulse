"use client"

import Link from "next/link"
import { History, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"
import { formatAPY, formatDate } from "@/lib/formatters"
import type { AlertHistoryEntry } from "@/types"
import { cn } from "@/lib/utils"

function HistoryRow({ entry }: { entry: AlertHistoryEntry }) {
  const date = new Date(entry.triggeredAt)
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800/50 last:border-0">
      {/* Time */}
      <div className="shrink-0 text-right min-w-[56px]">
        <p className="text-xs font-mono text-zinc-500">{timeStr}</p>
        <p className="text-[10px] text-zinc-700">{dateStr}</p>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-300 leading-relaxed">{entry.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-zinc-600 font-mono">
            APY at trigger: <span className="text-green-500">{formatAPY(entry.apyAtTrigger)}</span>
          </span>
        </div>
      </div>

      {/* Link to pool */}
      <Link
        href={`/pool/${entry.poolId}`}
        className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
        title="View pool"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

export function AlertHistory() {
  const alertHistory = useAppStore((s) => s.alertHistory)
  const clearAlertHistory = useAppStore((s) => s.clearAlertHistory)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          <History className="h-4 w-4" />
          Alert history
        </h2>
        {alertHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAlertHistory}
            className="h-7 text-xs text-zinc-600 hover:text-red-400 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        {alertHistory.length === 0 ? (
          <div className="py-10 text-center">
            <History className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-zinc-600">No alerts triggered yet</p>
          </div>
        ) : (
          <div className="px-4 divide-y divide-zinc-800/50">
            {alertHistory.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {alertHistory.length > 0 && (
        <p className="text-[11px] text-zinc-700 text-center">
          Showing last {alertHistory.length} triggered alert{alertHistory.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
