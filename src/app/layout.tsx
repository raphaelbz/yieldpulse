import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ErrorBoundary } from "@/components/layout/ErrorBoundary"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://yieldpulse.rafb.tech"),
  title: {
    default: "YieldPulse — DeFi Yield Aggregator",
    template: "%s — YieldPulse",
  },
  description:
    "Find, compare, and monitor the best DeFi yields across all major protocols. Real-time APY data powered by DefiLlama.",
  keywords: ["DeFi", "yield", "APY", "stablecoin", "crypto", "DefiLlama", "USDC", "yield farming", "DeFi dashboard"],
  authors: [{ name: "YieldPulse" }],
  creator: "YieldPulse",
  robots: { index: true, follow: true },
  openGraph: {
    title: "YieldPulse — DeFi Yield Aggregator",
    description: "Never miss the best yield again. Real-time APY tracking across 100+ DeFi protocols.",
    type: "website",
    url: "https://yieldpulse.rafb.tech",
    siteName: "YieldPulse",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "YieldPulse — DeFi Yield Aggregator",
    description: "Never miss the best yield again.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ErrorBoundary>
          <QueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryProvider>
        </ErrorBoundary>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.148 0.003 264)",
              border: "1px solid oklch(0.21 0.003 264)",
              color: "oklch(0.985 0 0)",
            },
          }}
        />
      </body>
    </html>
  )
}
