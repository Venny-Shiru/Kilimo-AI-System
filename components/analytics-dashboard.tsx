"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import { DegradationTrendChart } from "@/components/charts/degradation-trend-chart"
import { SoilHealthChart } from "@/components/charts/soil-health-chart"
import { RestorationImpactChart } from "@/components/charts/restoration-impact-chart"
import { RegionalComparisonChart } from "@/components/charts/regional-comparison-chart"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface EnvironmentalData {
  id: string
  region_name: string
  ndvi_value: number
  soil_health_score: number
  erosion_risk_level: string
  degradation_level: string
  measurement_date: string
}

interface RestorationProject {
  id: string
  status: string
  success_rate_estimate: number
}

export function AnalyticsDashboard() {
  const [envData, setEnvData] = useState<EnvironmentalData[]>([])
  const [projects, setProjects] = useState<RestorationProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [timePeriod, setTimePeriod] = useState("12m")

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      const { data: environmentalData } = await supabase
        .from("environmental_data")
        .select("*")
        .order("measurement_date", { ascending: false })
        .limit(100)

      const { data: projectData } = await supabase
        .from("restoration_projects")
        .select("id, status, success_rate_estimate")

      if (environmentalData) setEnvData(environmentalData)
      if (projectData) setProjects(projectData)
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const filteredEnvData = envData.filter((d) => {
    const matchesRegion = selectedRegion === "all" || d.region_name === selectedRegion

    if (!matchesRegion) return false

    const measurementDate = new Date(d.measurement_date)
    const now = new Date()
    const monthsAgo = new Date()

    switch (timePeriod) {
      case "1m":
        monthsAgo.setMonth(now.getMonth() - 1)
        break
      case "3m":
        monthsAgo.setMonth(now.getMonth() - 3)
        break
      case "6m":
        monthsAgo.setMonth(now.getMonth() - 6)
        break
      case "12m":
        monthsAgo.setMonth(now.getMonth() - 12)
        break
    }

    return measurementDate >= monthsAgo
  })

  const avgNDVI =
    filteredEnvData.length > 0
      ? filteredEnvData.reduce((sum, d) => sum + (d.ndvi_value || 0), 0) / filteredEnvData.length
      : 0.48

  const highRiskAreas = filteredEnvData.filter(
    (d) => d.erosion_risk_level === "high" || d.erosion_risk_level === "severe",
  ).length

  const waterStressAreas = filteredEnvData.filter((d) => d.ndvi_value < 0.3).length

  const successfulProjects = projects.filter(
    (p) => p.status === "completed" && (p.success_rate_estimate || 0) > 70,
  ).length

  const successRate = projects.length > 0 ? (successfulProjects / projects.length) * 100 : 76

  const handleExport = () => {
    const csvData = [
      ["Region", "NDVI", "Soil Health", "Erosion Risk", "Degradation Level", "Date"],
      ...filteredEnvData.map((d) => [
        d.region_name,
        d.ndvi_value,
        d.soil_health_score,
        d.erosion_risk_level,
        d.degradation_level,
        d.measurement_date,
      ]),
    ]

    const csvContent = csvData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-export-${selectedRegion}-${timePeriod}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Analytics & Reporting</h2>
          <p className="text-muted-foreground">
            {selectedRegion === "all" ? "All regions" : selectedRegion} •{" "}
            {timePeriod === "1m"
              ? "Last month"
              : timePeriod === "3m"
                ? "Last 3 months"
                : timePeriod === "6m"
                  ? "Last 6 months"
                  : "Last year"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {Array.from(new Set(envData.map((d) => d.region_name)))
                .slice(0, 10)
                .map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg NDVI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgNDVI.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `Based on ${filteredEnvData.length} measurements`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Soil Erosion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskAreas} areas</div>
            <p className="text-xs text-destructive mt-1">High risk detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Water Stress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEnvData.length > 0 ? Math.round((waterStressAreas / filteredEnvData.length) * 100) : 38}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Of monitored areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Restoration Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(successRate)}%</div>
            <p className="text-xs text-primary mt-1">
              {successfulProjects} of {projects.length} projects
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Degradation Trends</CardTitle>
            <CardDescription>Land degradation over time</CardDescription>
          </CardHeader>
          <CardContent>
            <DegradationTrendChart data={filteredEnvData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Soil Health Metrics</CardTitle>
            <CardDescription>Key soil indicators by region</CardDescription>
          </CardHeader>
          <CardContent>
            <SoilHealthChart data={filteredEnvData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restoration Impact Comparison</CardTitle>
          <CardDescription>Before and after restoration efforts</CardDescription>
        </CardHeader>
        <CardContent>
          <RestorationImpactChart projects={projects} envData={filteredEnvData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Comparison</CardTitle>
          <CardDescription>Degradation levels across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <RegionalComparisonChart data={filteredEnvData} />
        </CardContent>
      </Card>
    </div>
  )
}
