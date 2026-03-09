// ============================================================
// YieldPulse — useAlerts hook
// CRUD wrapper over Zustand alert store
// ============================================================

import { useCallback } from "react"
import { useAppStore } from "@/store/useAppStore"
import { generateId } from "@/lib/utils"
import type { Alert, AlertType } from "@/types"

interface CreateAlertInput {
  type: AlertType
  poolId: string | null
  chain: string | null
  symbol: string | null
  threshold: number
  stablecoinOnly: boolean
}

export function useAlerts() {
  const alerts = useAppStore((s) => s.alerts)
  const addAlert = useAppStore((s) => s.addAlert)
  const updateAlert = useAppStore((s) => s.updateAlert)
  const removeAlert = useAppStore((s) => s.removeAlert)
  const toggleAlert = useAppStore((s) => s.toggleAlert)

  const createAlert = useCallback(
    (input: CreateAlertInput): Alert => {
      const alert: Alert = {
        id: generateId(),
        ...input,
        createdAt: new Date().toISOString(),
        enabled: true,
      }
      addAlert(alert)
      return alert
    },
    [addAlert]
  )

  const enabledAlerts = alerts.filter((a) => a.enabled)

  return {
    alerts,
    enabledAlerts,
    createAlert,
    updateAlert,
    removeAlert,
    toggleAlert,
  }
}
