"use client"

import { Bell, BellRing, Info } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AlertForm } from "@/components/alerts/AlertForm"
import { AlertList } from "@/components/alerts/AlertList"
import { AlertHistory } from "@/components/alerts/AlertHistory"
import { AlertEngine } from "@/components/alerts/AlertEngine"
import { useAlerts } from "@/hooks/useAlerts"

// ─── Notification permission banner ──────────────────────────────────────────

function NotifBanner() {
  if (typeof window === "undefined") return null
  if (!("Notification" in window)) return null
  if (Notification.permission === "granted") return null

  const isDenied = Notification.permission === "denied"

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
      <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
      <div className="text-xs text-amber-300/80">
        {isDenied ? (
          <>Browser notifications are blocked. Enable them in your browser settings to receive alerts.</>
        ) : (
          <>Browser notifications are not enabled. You&apos;ll be asked for permission when you create your first alert.</>
        )}
      </div>
    </div>
  )
}

// ─── Stats strip ─────────────────────────────────────────────────────────────

function AlertsStats() {
  const { alerts, enabledAlerts } = useAlerts()
  const alertHistory = useAlerts()

  return (
    <div className="flex items-center gap-6 text-xs text-zinc-500">
      <span>
        <span className="text-white font-semibold font-mono">{alerts.length}</span>{" "}
        alert{alerts.length !== 1 ? "s" : ""} configured
      </span>
      <span>
        <span className="text-green-400 font-semibold font-mono">{enabledAlerts.length}</span>{" "}
        active
      </span>
      <span>
        <span className="text-zinc-300 font-semibold font-mono">{alerts.length - enabledAlerts.length}</span>{" "}
        paused
      </span>
    </div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function AlertsClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 -top-64 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(34,197,94,0.06),transparent)]" />
      </div>
      <Navbar />

      <main className="relative z-10 flex-1 mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BellRing className="h-6 w-6 text-green-400" />
            Alerts
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Get notified when APY conditions are met — browser push + in-app toasts
          </p>
        </div>

        {/* Notification permission warning (client-only) */}
        <NotifBanner />

        {/* Stats */}
        <AlertsStats />

        {/* Create form */}
        <AlertForm />

        {/* Active alerts list */}
        <AlertList />

        {/* History */}
        <AlertHistory />
      </main>

      <Footer />

      {/* Alert engine also runs here (when browsing /alerts) */}
      <AlertEngine />
    </div>
  )
}
