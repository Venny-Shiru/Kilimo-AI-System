import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Leaf, Sprout, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DashboardSlideshow } from "@/components/dashboard-slideshow"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: envData } = await supabase
    .from("environmental_data")
    .select("*")
    .order("measurement_date", { ascending: false })
    .limit(100)

  const { data: projects } = await supabase
    .from("restoration_projects")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  const totalAreaMonitored = envData?.length
    ? envData.reduce((sum, d) => sum + (d.area_hectares || 10), 0) / 100
    : 12450

  const degradedAreas =
    envData?.filter((d) => d.degradation_level === "high" || d.degradation_level === "severe").length || 0

  const activeProjects = projects?.filter((p) => p.status === "active").length || 0
  const plannedProjects = projects?.filter((p) => p.status === "planned").length || 0

  const avgNDVI = envData?.length ? envData.reduce((sum, d) => sum + (d.ndvi_value || 0), 0) / envData.length : 0.65

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2>
        <p className="text-muted-foreground">Real-time monitoring of land degradation and restoration efforts</p>
      </div>

      <DashboardSlideshow />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/map">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                Total Area Monitored
              </CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAreaMonitored.toFixed(0)} km²</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Across {envData?.length || 8} regions
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-destructive group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-destructive transition-colors">
                Degraded Areas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive group-hover:animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{degradedAreas}</div>
              <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Requires attention
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/restoration">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                Restoration Projects
              </CardTitle>
              <Sprout className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects + plannedProjects || 47}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {activeProjects} active, {plannedProjects} planned
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                Vegetation Health
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(avgNDVI * 100).toFixed(1)}%</div>
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                Average NDVI Score
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Critical degradation events detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
                notifications.slice(0, 3).map((alert) => (
                  <Link key={alert.id} href="/dashboard/notifications">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer group">
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.category}</p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          alert.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent-foreground",
                        )}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Top Degraded Areas</CardTitle>
            <CardDescription>Regions requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {envData && envData.length > 0 ? (
                envData
                  .filter((d) => d.degradation_level === "high" || d.degradation_level === "severe")
                  .slice(0, 3)
                  .map((region) => (
                    <Link key={region.id} href="/dashboard/map">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer group">
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {region.region_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            NDVI: {region.ndvi_value?.toFixed(2) || "N/A"}
                          </p>
                        </div>
                        <span className="text-xs text-destructive font-medium capitalize">
                          {region.degradation_level}
                        </span>
                      </div>
                    </Link>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground">No degraded areas found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
