import { cn } from "@/lib/utils"
import { formatAPY } from "@/lib/formatters"

interface APYBadgeProps {
  apy: number | null | undefined
  className?: string
  size?: "sm" | "md" | "lg"
}

export function APYBadge({ apy, className, size = "md" }: APYBadgeProps) {
  const isNull = apy === null || apy === undefined
  const isNegative = !isNull && apy < 0
  const isHigh = !isNull && apy >= 20

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono tabular-nums font-semibold rounded-lg px-1.5 py-0.5",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-2xl font-bold px-2.5 py-1",
        isNull && "text-slate-600 bg-transparent",
        isNegative && "text-red-400 bg-red-500/[0.08] border border-red-500/[0.12]",
        isHigh && "text-emerald-300 bg-emerald-500/[0.12] border border-emerald-500/[0.2] shadow-[0_0_8px_rgba(52,211,153,0.15)]",
        !isNull && !isNegative && !isHigh && "text-emerald-400 bg-emerald-500/[0.08] border border-emerald-500/[0.12]",
        className
      )}
    >
      {formatAPY(apy)}
    </span>
  )
}
