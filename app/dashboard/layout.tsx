import type React from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNavbar />
      <main className="flex-1 p-6">{children}</main>
      <DashboardFooter />
    </div>
  )
}
