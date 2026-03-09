import { AlertsClient } from "@/components/alerts/AlertsClient"

export const metadata = {
  title: "Alerts",
  description: "Set APY threshold alerts for DeFi pools. Get browser notifications when yields hit your targets.",
}

export default function AlertsPage() {
  return <AlertsClient />
}
