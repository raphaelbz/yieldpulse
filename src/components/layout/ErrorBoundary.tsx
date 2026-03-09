"use client"

import React from "react"
import { AlertOctagon, RefreshCw } from "lucide-react"

interface State {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, errorMessage: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[YieldPulse ErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <AlertOctagon className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
              <p className="text-sm text-zinc-500 mt-1">
                An unexpected error occurred. Please refresh the page.
              </p>
              {this.state.errorMessage && (
                <p className="text-xs text-zinc-700 mt-3 font-mono bg-zinc-950 rounded-lg px-3 py-2 text-left break-words">
                  {this.state.errorMessage}
                </p>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
