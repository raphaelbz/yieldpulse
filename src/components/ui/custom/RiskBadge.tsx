import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/types"

interface RiskBadgeProps {
  level: RiskLevel
  score?: number
  className?: string
}

const CONFIG: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  low: {
    label: "Low",
    className: "bg-green-500/[0.08] text-green-400 border-green-500/[0.15]",
    dot: "bg-green-400",
  },
  medium: {
    label: "Med",
    className: "bg-amber-500/[0.08] text-amber-400 border-amber-500/[0.15]",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    className: "bg-red-500/[0.08] text-red-400 border-red-500/[0.15]",
    dot: "bg-red-400",
  },
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const { label, className: colorClass, dot } = CONFIG[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
      {score !== undefined && (
        <span className="font-mono tabular-nums opacity-50 text-[10px]">{score}</span>
      )}
    </span>
  )
}
