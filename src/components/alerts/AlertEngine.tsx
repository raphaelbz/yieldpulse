"use client"

// Invisible component — mounts the alert engine on the dashboard.
// Placed inside DashboardClient so it only runs when pool data is live.

import { useAlertEngine } from "@/hooks/useAlertEngine"
import { useAppStore } from "@/store/useAppStore"
import { usePools } from "@/hooks/usePools"

export function AlertEngine() {
  const { pools } = usePools()
  const lastRefreshedAt = useAppStore((s) => s.lastRefreshedAt)

  useAlertEngine({ pools, lastRefreshedAt })

  return null
}
