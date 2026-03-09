"use client"

import { computeRiskScore } from "@/lib/risk"
import type { Pool, RiskBreakdown, RiskLevel } from "@/types"
import { cn } from "@/lib/utils"

// ─── Score Arc (SVG circle) ───────────────────────────────────────────────────

function ScoreArc({ score, level }: { score: number; level: RiskLevel }) {
  const radius = 52
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  // Fill 75% of the circle max (270° sweep starting from bottom-left)
  const dashOffset = circumference - (score / 100) * circumference * 0.75

  const color: Record<RiskLevel, string> = {
    low: "#22c55e",
    medium: "#f59e0b",
    high: "#ef4444",
  }

  const label: Record<RiskLevel, string> = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
  }

  const size = (radius + stroke) * 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[135deg]"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color[level]}
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75 - dashOffset} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>

      {/* Score in center */}
      <div className="-mt-20 flex flex-col items-center">
        <span
          className="text-3xl font-bold font-mono tabular-nums"
          style={{ color: color[level] }}
        >
          {score}
        </span>
        <span className="text-xs text-zinc-500">/100</span>
        <span
          className="text-xs font-semibold mt-1"
          style={{ color: color[level] }}
        >
          {label[level]}
        </span>
      </div>
    </div>
  )
}

// ─── Factor Bar ───────────────────────────────────────────────────────────────

function FactorBar({
  label,
  score,
  max,
  description,
}: {
  label: string
  score: number
  max: number
  description: string
}) {
  const pct = (score / max) * 100
  const color =
    pct <= 33 ? "#22c55e" : pct <= 66 ? "#f59e0b" : "#ef4444"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300 font-medium">{label}</span>
        <span className="font-mono tabular-nums" style={{ color }}>
          {score}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] text-zinc-600">{description}</p>
    </div>
  )
}

// ─── Main RiskAssessment ──────────────────────────────────────────────────────

function factorDescription(factor: keyof RiskBreakdown, score: number): string {
  switch (factor) {
    case "tvlFactor":
      return score === 0 ? "TVL > $1B — very liquid" :
             score <= 5  ? "TVL $100M–$1B" :
             score <= 10 ? "TVL $10M–$100M" :
             score <= 15 ? "TVL $1M–$10M" :
             score <= 20 ? "TVL $100K–$1M" :
             "TVL < $100K — low liquidity"
    case "apySustainability":
      return score === 0 ? "APY < 10% — likely sustainable" :
             score <= 5  ? "APY 10–20% — moderate" :
             score <= 12 ? "APY 20–50% — elevated" :
             score <= 20 ? "APY 50–100% — high" :
             "APY > 100% — very high, verify source"
    case "rewardDependency":
      return score === 0 ? "Mostly base yield — organic" :
             score <= 5  ? "< 20% reward dependent" :
             score <= 12 ? "20–50% reward dependent" :
             "Heavily token incentive–dependent"
    case "ilRisk":
      return score === 0 ? "Single-asset — no IL" :
             score <= 8  ? "Multi-asset — some IL possible" :
             "Active IL risk flagged"
    case "apyVolatility":
      return score === 0 ? "APY stable (< 10% 30d change)" :
             score <= 5  ? "Mild volatility (10–20% change)" :
             score <= 10 ? "Moderate volatility (20–50%)" :
             "High volatility — APY swings > 50%"
    default:
      return ""
  }
}

const FACTOR_META: {
  key: keyof RiskBreakdown
  label: string
  max: number
}[] = [
  { key: "tvlFactor", label: "TVL / Liquidity", max: 25 },
  { key: "apySustainability", label: "APY Sustainability", max: 25 },
  { key: "rewardDependency", label: "Reward Dependency", max: 20 },
  { key: "ilRisk", label: "Impermanent Loss Risk", max: 15 },
  { key: "apyVolatility", label: "APY Volatility (30d)", max: 15 },
]

interface RiskAssessmentProps {
  pool: Pool
}

export function RiskAssessment({ pool }: RiskAssessmentProps) {
  const { score, level, breakdown } = computeRiskScore(pool)

  const levelConfig: Record<RiskLevel, { bg: string; border: string; text: string }> = {
    low: { bg: "bg-green-500/5", border: "border-green-500/20", text: "text-green-400" },
    medium: { bg: "bg-amber-500/5", border: "border-amber-500/20", text: "text-amber-400" },
    high: { bg: "bg-red-500/5", border: "border-red-500/20", text: "text-red-400" },
  }

  const { bg, border } = levelConfig[level]

  return (
    <div className={cn("rounded-xl border p-5 space-y-5", bg, border)}>
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Risk Assessment</h2>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Score arc */}
        <div className="shrink-0">
          <ScoreArc score={score} level={level} />
        </div>

        {/* Factor breakdown */}
        <div className="flex-1 space-y-4 w-full">
          <p className="text-xs text-zinc-500">
            Score breakdown (lower = safer, max 100)
          </p>
          {FACTOR_META.map(({ key, label, max }) => (
            <FactorBar
              key={key}
              label={label}
              score={breakdown[key]}
              max={max}
              description={factorDescription(key, breakdown[key])}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-zinc-600 border-t border-zinc-800 pt-3">
        Risk scores are computed algorithmically from on-chain data (TVL, APY level, reward dependency, IL exposure, volatility).
        They are informational only — not financial advice. Always do your own research.
      </p>
    </div>
  )
}
