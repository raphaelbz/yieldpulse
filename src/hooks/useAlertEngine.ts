// ============================================================
// YieldPulse — useAlertEngine hook
// Checks alert conditions on every pool data refresh.
// Fires browser Notification + Sonner toast when triggered.
// ============================================================

"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useAppStore } from "@/store/useAppStore"
import { generateId } from "@/lib/utils"
import { formatAPY } from "@/lib/formatters"
import type { Alert, AlertHistoryEntry, Pool } from "@/types"

// ─── Permission helper ────────────────────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  const result = await Notification.requestPermission()
  return result === "granted"
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: "yieldpulse-alert",
  })
}

// ─── Condition checker ────────────────────────────────────────────────────────

function checkAlert(alert: Alert, pool: Pool): boolean {
  const apy = pool.apy ?? 0

  switch (alert.type) {
    case "apy_above":
      return apy >= alert.threshold
    case "apy_below":
      return apy <= alert.threshold
    case "apy_change":
      return Math.abs(pool.apyPct1D ?? 0) >= alert.threshold
    default:
      return false
  }
}

function poolMatchesAlert(alert: Alert, pool: Pool): boolean {
  // If specific pool, must match exactly
  if (alert.poolId && alert.poolId !== pool.pool) return false
  // Chain filter
  if (alert.chain && alert.chain !== pool.chain) return false
  // Symbol filter (partial match)
  if (alert.symbol && !pool.symbol.toUpperCase().includes(alert.symbol.toUpperCase())) return false
  // Stablecoin filter
  if (alert.stablecoinOnly && !pool.stablecoin) return false
  return true
}

function buildMessage(alert: Alert, pool: Pool): string {
  const apy = formatAPY(pool.apy)
  switch (alert.type) {
    case "apy_above":
      return `${pool.symbol} on ${pool.chain} (${pool.project}) APY is ${apy} — above your ${alert.threshold}% threshold`
    case "apy_below":
      return `${pool.symbol} on ${pool.chain} (${pool.project}) APY dropped to ${apy} — below your ${alert.threshold}% threshold`
    case "apy_change":
      return `${pool.symbol} on ${pool.chain} (${pool.project}) APY changed ${formatAPY(pool.apyPct1D)} in 24h — exceeds your ${alert.threshold}% change alert`
    default:
      return `Alert triggered for ${pool.symbol}`
  }
}

// ─── Dedup: don't re-fire same alert for same pool within 1h ─────────────────

function wasRecentlyTriggered(
  alertId: string,
  poolId: string,
  history: AlertHistoryEntry[]
): boolean {
  const ONE_HOUR = 60 * 60 * 1000
  return history.some(
    (h) =>
      h.alertId === alertId &&
      h.poolId === poolId &&
      Date.now() - new Date(h.triggeredAt).getTime() < ONE_HOUR
  )
}

// ─── Main hook ────────────────────────────────────────────────────────────────

interface UseAlertEngineOptions {
  pools: Pool[]
  lastRefreshedAt: number | null
}

export function useAlertEngine({ pools, lastRefreshedAt }: UseAlertEngineOptions) {
  const alerts = useAppStore((s) => s.alerts)
  const alertHistory = useAppStore((s) => s.alertHistory)
  const addAlertHistory = useAppStore((s) => s.addAlertHistory)

  // Track which refresh we last processed (avoid double-firing)
  const lastProcessedRef = useRef<number | null>(null)

  useEffect(() => {
    if (!lastRefreshedAt || lastRefreshedAt === lastProcessedRef.current) return
    if (!pools.length) return

    const enabledAlerts = alerts.filter((a) => a.enabled)
    if (!enabledAlerts.length) return

    lastProcessedRef.current = lastRefreshedAt

    const triggered: { alert: Alert; pool: Pool }[] = []

    for (const alert of enabledAlerts) {
      for (const pool of pools) {
        if (!poolMatchesAlert(alert, pool)) continue
        if (!checkAlert(alert, pool)) continue
        if (wasRecentlyTriggered(alert.id, pool.pool, alertHistory)) continue
        triggered.push({ alert, pool })
        // One match per alert (don't spam for "any pool" alerts)
        if (!alert.poolId) break
      }
    }

    if (!triggered.length) return

    // Fire notifications (request permission lazily on first trigger)
    void requestNotificationPermission()

    for (const { alert, pool } of triggered) {
      const message = buildMessage(alert, pool)

      // Sonner in-app toast
      toast(message, {
        description: `YieldPulse Alert`,
        duration: 8000,
        action: {
          label: "View pool",
          onClick: () => window.open(`/pool/${pool.pool}`, "_self"),
        },
      })

      // Browser notification
      sendBrowserNotification("YieldPulse Alert", message)

      // Persist to history
      const entry: AlertHistoryEntry = {
        id: generateId(),
        alertId: alert.id,
        poolId: pool.pool,
        poolSymbol: pool.symbol,
        chain: pool.chain,
        project: pool.project,
        triggeredAt: new Date().toISOString(),
        apyAtTrigger: pool.apy ?? 0,
        message,
      }
      addAlertHistory(entry)
    }
  }, [lastRefreshedAt, pools, alerts, alertHistory, addAlertHistory])
}
