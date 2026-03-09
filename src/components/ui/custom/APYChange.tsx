import { cn } from "@/lib/utils"
import { formatAPYChange } from "@/lib/formatters"

interface APYChangeProps {
  value: number | null | undefined
  className?: string
}

export function APYChange({ value, className }: APYChangeProps) {
  const { text, isPositive, isNeutral } = formatAPYChange(value)
  return (
    <span
      className={cn(
        "font-mono tabular-nums text-xs",
        isNeutral && "text-zinc-500",
        !isNeutral && isPositive && "text-green-400",
        !isNeutral && !isPositive && "text-red-400",
        className
      )}
    >
      {text}
    </span>
  )
}
