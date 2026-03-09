"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatProtocolName } from "@/lib/formatters"

interface ProtocolLogoProps {
  project: string
  size?: number
  className?: string
  showName?: boolean
}

export function ProtocolLogo({ project, size = 20, className, showName = false }: ProtocolLogoProps) {
  const [imgError, setImgError] = useState(false)
  const initial = project.charAt(0).toUpperCase()
  const iconUrl = `https://icons.llamao.fi/icons/protocols/${project}`

  return (
    <span className={cn("inline-flex items-center gap-1.5 min-w-0", className)}>
      {!imgError ? (
        <Image
          src={iconUrl}
          alt={project}
          width={size}
          height={size}
          className="rounded-md object-cover shrink-0"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
          unoptimized
        />
      ) : (
        <span
          className="rounded-md flex items-center justify-center font-bold text-white bg-zinc-700 shrink-0"
          style={{ width: size, height: size, fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      )}
      {showName && (
        <span className="text-sm text-zinc-300 truncate">
          {formatProtocolName(project)}
        </span>
      )}
    </span>
  )
}
