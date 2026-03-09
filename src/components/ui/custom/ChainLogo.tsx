"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { CHAINS } from "@/lib/constants"

interface ChainLogoProps {
  chain: string
  size?: number
  className?: string
  showName?: boolean
}

export function ChainLogo({ chain, size = 20, className, showName = false }: ChainLogoProps) {
  const [imgError, setImgError] = useState(false)
  const config = CHAINS[chain]
  const color = config?.color ?? "#71717a"
  const initial = chain.charAt(0).toUpperCase()

  const iconUrl = `https://icons.llamao.fi/icons/chains/rsz_${chain.toLowerCase()}.jpg`

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {!imgError ? (
        <Image
          src={iconUrl}
          alt={chain}
          width={size}
          height={size}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <span
          className="rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            fontSize: size * 0.4,
          }}
        >
          {initial}
        </span>
      )}
      {showName && <span className="text-sm text-zinc-300">{chain}</span>}
    </span>
  )
}
