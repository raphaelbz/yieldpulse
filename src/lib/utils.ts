import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a DefiLlama chain icon URL.
 */
export function chainIconUrl(chainName: string): string {
  return `https://icons.llamao.fi/icons/chains/rsz_${chainName.toLowerCase()}.jpg`
}

/**
 * Generate a DefiLlama protocol icon URL.
 */
export function protocolIconUrl(protocolSlug: string): string {
  return `https://icons.llamao.fi/icons/protocols/${protocolSlug}`
}

/**
 * Safe localStorage getter with JSON parsing.
 */
export function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * Safe localStorage setter with JSON serialization.
 */
export function lsSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded or private browsing — silently fail
  }
}

/**
 * Generate a random ID (for alerts, etc.)
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}
