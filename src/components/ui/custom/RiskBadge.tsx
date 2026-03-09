import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/types"

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  className?: string
}

const CONFIG: Record<RiskLevel, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  high: {
    label: "High",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const { label, className: colorClass } = CONFIG[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-70">{score}</span>
      )}
    </span>
  )
}
