"use client"

import { AlertTriangle, RefreshCw, X } from "lucide-react"
import { useState } from "react"

interface ApiErrorBannerProps {
  onRetry: () => void
}

export function ApiErrorBanner({ onRetry }: ApiErrorBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm animate-fade-in">
      <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
      <div className="flex-1 min-w-0">
        <span className="text-red-300 font-medium">DefiLlama API unavailable</span>
        <span className="text-red-400/70 ml-2">
          Could not fetch pool data. Showing cached data if available.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 rounded-lg px-2.5 py-1 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-500/50 hover:text-red-400 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
