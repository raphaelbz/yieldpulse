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
        "font-mono tabular-nums font-semibold",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-2xl",
        isNull && "text-zinc-500",
        isNegative && "text-red-400",
        isHigh && "text-green-300",
        !isNull && !isNegative && !isHigh && "text-green-400",
        className
      )}
    >
      {formatAPY(apy)}
    </span>
  )
}
