"use client"

import { Bell, BellOff, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAlerts } from "@/hooks/useAlerts"
import { usePools } from "@/hooks/usePools"
import { formatDate, formatAPY, formatProtocolName } from "@/lib/formatters"
import type { Alert, AlertType } from "@/types"
import { cn } from "@/lib/utils"

// ─── Type icon / label ────────────────────────────────────────────────────────

function AlertTypeIcon({ type }: { type: AlertType }) {
  switch (type) {
    case "apy_above": return <TrendingUp className="h-3.5 w-3.5 text-green-400" />
    case "apy_below": return <TrendingDown className="h-3.5 w-3.5 text-red-400" />
    case "apy_change": return <Activity className="h-3.5 w-3.5 text-amber-400" />
  }
}

function alertTypeLabel(type: AlertType): string {
  switch (type) {
    case "apy_above": return "APY above"
    case "apy_below": return "APY below"
    case "apy_change": return "APY change ≥"
  }
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({ alert }: { alert: Alert }) {
  const { toggleAlert, removeAlert } = useAlerts()
  const { pools } = usePools()

  const targetPool = alert.poolId ? pools.find((p) => p.pool === alert.poolId) : null

  return (
    <div className={cn(
      "rounded-xl border p-4 flex items-start gap-4 transition-colors",
      alert.enabled
        ? "border-white/[0.07] bg-[#1c1c1e]"
        : "border-white/[0.04] bg-[#1c1c1e]/40 opacity-60"
    )}>
      {/* Icon */}
      <div className="shrink-0 mt-0.5 rounded-lg bg-zinc-800 p-2">
        <AlertTypeIcon type={alert.type} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Condition headline */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white">
            {alertTypeLabel(alert.type)}{" "}
            <span className="font-mono text-green-400">{formatAPY(alert.threshold)}</span>
          </span>
          {!alert.enabled && (
            <Badge className="bg-zinc-700 text-zinc-400 border-0 text-[10px]">Paused</Badge>
          )}
        </div>

        {/* Scope */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500">
          {targetPool ? (
            <span className="font-medium text-zinc-400">
              {targetPool.symbol} · {formatProtocolName(targetPool.project)} · {targetPool.chain}
            </span>
          ) : (
            <>
              <span>{alert.symbol ? `Token: ${alert.symbol}` : "Any token"}</span>
              <span>·</span>
              <span>{alert.chain ? `Chain: ${alert.chain}` : "Any chain"}</span>
              {alert.stablecoinOnly && <><span>·</span><span className="text-blue-400">Stablecoins only</span></>}
            </>
          )}
        </div>

        <p className="text-[11px] text-zinc-600">Created {formatDate(alert.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleAlert(alert.id)}
          className={cn(
            "h-8 w-8 p-0",
            alert.enabled ? "text-green-400 hover:text-green-300" : "text-zinc-600 hover:text-zinc-400"
          )}
          title={alert.enabled ? "Pause alert" : "Enable alert"}
        >
          {alert.enabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeAlert(alert.id)}
          className="h-8 w-8 p-0 text-zinc-600 hover:text-red-400"
          title="Delete alert"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── AlertList ────────────────────────────────────────────────────────────────

export function AlertList() {
  const { alerts } = useAlerts()

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-[#1c1c1e] py-12 text-center">
        <BellOff className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm font-medium">No alerts yet</p>
        <p className="text-zinc-600 text-xs mt-1">Create your first alert above</p>
      </div>
    )
  }

  const enabled = alerts.filter((a) => a.enabled)
  const paused = alerts.filter((a) => !a.enabled)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
          Active alerts
        </h2>
        <span className="text-xs text-zinc-600 font-mono">
          {enabled.length} active · {paused.length} paused
        </span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}
