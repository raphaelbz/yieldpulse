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
        "inline-flex items-center font-mono tabular-nums font-semibold rounded-md px-1.5 py-0.5",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-xl",
        isNull && "text-zinc-600 bg-transparent",
        isNegative && "text-red-400 bg-red-500/[0.08]",
        isHigh && "text-green-300 bg-green-500/[0.1]",
        !isNull && !isNegative && !isHigh && "text-green-400 bg-green-500/[0.08]",
        className
      )}
    >
      {formatAPY(apy)}
    </span>
  )
}
