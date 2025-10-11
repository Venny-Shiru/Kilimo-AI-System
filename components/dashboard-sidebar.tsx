"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Map,
  BarChart3,
  Sprout,
  Bell,
  Settings,
  Database,
  Leaf,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Map Viewer", href: "/dashboard/map", icon: Map },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Restoration Planner", href: "/dashboard/restoration", icon: Sprout },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Data Management", href: "/dashboard/data", icon: Database },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn("border-r border-border bg-card transition-all duration-300", isCollapsed ? "w-16" : "w-64")}>
      <div className={cn("p-6 transition-all", isCollapsed && "p-3")}>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <>
              <h2 className="text-lg font-bold text-foreground">Kilimo(Agri)protect AI</h2>
            </>
          )}
        </div>
        {!isCollapsed && <p className="text-xs text-muted-foreground mt-1">Environmental Monitoring</p>}
      </div>

      <div className="px-3 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed && "justify-center",
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
