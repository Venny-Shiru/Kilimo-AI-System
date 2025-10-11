"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layers, X, Info, MapPin, Plus, Minus, Sparkles, Search, CheckCircle2, ExternalLink } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

type Layer = {
  id: string
  name: string
  enabled: boolean
  color: string
}

type SelectedArea = {
  name: string
  coordinates: string
  ndvi: number
  erosionRisk: string
  landUse: string
  soilHealth: number
  position: { top: string; left: string }
}

interface EnvironmentalDataPoint {
  id: string
  region_id: string
  region_name: string
  latitude: number
  longitude: number
  ndvi_value: number
  erosion_risk_level: string
  land_use_type: string
  soil_health_score: number
  degradation_level: string
}

export function MapViewer() {
  const [showLayers, setShowLayers] = useState(true)
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [budget, setBudget] = useState("500000")
  const [duration, setDuration] = useState("24")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [realMapData, setRealMapData] = useState<EnvironmentalDataPoint[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const [layers, setLayers] = useState<Layer[]>([
    { id: "ndvi", name: "Vegetation Health (NDVI)", enabled: true, color: "bg-green-500" },
    { id: "erosion", name: "Soil Erosion Risk", enabled: true, color: "bg-orange-500" },
    { id: "landuse", name: "Land Use/Cover", enabled: false, color: "bg-blue-500" },
    { id: "projects", name: "Restoration Projects", enabled: true, color: "bg-purple-500" },
    { id: "sensors", name: "IoT Sensors", enabled: false, color: "bg-yellow-500" },
  ])

  const toggleLayer = (id: string) => {
    setLayers(layers.map((layer) => (layer.id === id ? { ...layer, enabled: !layer.enabled } : layer)))
  }

  const handleAreaClick = (area: SelectedArea) => {
    setSelectedArea(area)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleCreatePlan = () => {
    if (!selectedArea) return
    setProjectName(`${selectedArea.name} Restoration Project`)
    setShowPlanDialog(true)
  }

  const handleSavePlan = async () => {
    if (!selectedArea) return

    setIsSaving(true)
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a restoration plan",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (!existingProfile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          role: "viewer",
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
          toast({
            title: "Error",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      const startDate = new Date()
      const estimatedCompletionDate = new Date()
      estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + Number.parseInt(duration))

      const areaHectares =
        selectedArea.landUse === "Agricultural" ? 450 : selectedArea.landUse === "Mixed Forest" ? 280 : 320

      const { data, error } = await supabase
        .from("restoration_projects")
        .insert({
          project_name: projectName,
          region_name: selectedArea.name,
          region_id: selectedArea.coordinates.replace(/[°\s]/g, "-"), // Convert coordinates to valid region_id
          area_hectares: areaHectares,
          budget_allocated: Number.parseFloat(budget),
          budget_spent: 0,
          start_date: startDate.toISOString().split("T")[0],
          estimated_completion_date: estimatedCompletionDate.toISOString().split("T")[0],
          status: "planned",
          success_rate_estimate: selectedArea.ndvi < 0.3 ? 75 : selectedArea.ndvi < 0.4 ? 82 : 88,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setSavedProjectId(data.id)
      setShowPlanDialog(false)
      setShowSuccessDialog(true)

      toast({
        title: "Success!",
        description: "Restoration plan created successfully",
      })
    } catch (error) {
      console.error("Error saving restoration plan:", error)
      toast({
        title: "Error",
        description: "Failed to create restoration plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    setProjectName("")
    setBudget("500000")
    setDuration("24")
    setNotes("")
    setSelectedArea(null)
    setSavedProjectId(null)
    router.refresh()
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const foundArea = realMapData.find(
      (area) =>
        area.region_name.toLowerCase().includes(searchQuery.toLowerCase()) || area.region_id.includes(searchQuery),
    )

    if (foundArea) {
      setSelectedArea({
        name: foundArea.region_name,
        coordinates: `${foundArea.latitude.toFixed(1)}°N, ${foundArea.longitude.toFixed(1)}°E`,
        ndvi: foundArea.ndvi_value || 0.35,
        erosionRisk:
          foundArea.erosion_risk_level === "high" || foundArea.erosion_risk_level === "severe" ? "High" : "Medium",
        landUse: foundArea.land_use_type || "Mixed",
        soilHealth: foundArea.soil_health_score || 50,
        position: { top: "20%", left: "30%" },
      })
      setShowSearchDialog(false)
      setSearchQuery("")
      toast({
        title: "Location Found",
        description: `Showing details for ${foundArea.region_name}`,
      })
    } else {
      toast({
        title: "Location Not Found",
        description: "Try searching by region name or coordinates",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchEnvironmentalData = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("environmental_data")
        .select("*")
        .order("measurement_date", { ascending: false })
        .limit(50)

      if (data && data.length > 0) {
        setRealMapData(data)
      }
      setIsLoadingData(false)
    }

    fetchEnvironmentalData()
  }, [])

  const mapAreas =
    realMapData.length > 0
      ? realMapData.slice(0, 10).map((data, index) => ({
          name: data.region_name,
          coordinates: `${data.latitude.toFixed(1)}°N, ${data.longitude.toFixed(1)}°E`,
          ndvi: data.ndvi_value || 0.35,
          erosionRisk: data.erosion_risk_level === "high" || data.erosion_risk_level === "severe" ? "High" : "Medium",
          landUse: data.land_use_type || "Mixed",
          soilHealth: data.soil_health_score || 50,
          position: {
            top: `${20 + index * 8}%`,
            left: `${30 + (index % 3) * 20}%`,
          },
        }))
      : [
          {
            name: "Northern Plains - Sector 12",
            coordinates: "34.5°N, 45.2°E",
            ndvi: 0.35,
            erosionRisk: "High",
            landUse: "Agricultural",
            soilHealth: 42,
            position: { top: "20%", left: "30%" },
          },
          {
            name: "Eastern Valley - Sector 8",
            coordinates: "32.1°N, 48.7°E",
            ndvi: 0.52,
            erosionRisk: "Medium",
            landUse: "Mixed Forest",
            soilHealth: 68,
            position: { top: "45%", left: "65%" },
          },
          {
            name: "Southern Hills - Sector 5",
            coordinates: "29.8°N, 43.9°E",
            ndvi: 0.28,
            erosionRisk: "High",
            landUse: "Degraded Land",
            soilHealth: 35,
            position: { top: "70%", left: "40%" },
          },
        ]

  return (
    <>
      <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-border">
        {isLoadingData && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {mapAreas.map((area, i) => (
            <div key={`area-${i}`}>
              <button
                onClick={() => handleAreaClick(area)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={area.position}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full transition-all ${
                    area.erosionRisk === "High"
                      ? "bg-destructive/30 border-2 border-destructive"
                      : "bg-accent/30 border-2 border-accent"
                  } group-hover:scale-110 group-hover:shadow-lg`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 sm:h-7 sm:h-7 md:h-8 md:w-8 text-foreground" />
                  </div>
                </div>
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                    <p className="text-xs font-medium">{area.name}</p>
                    <p className="text-xs text-muted-foreground">NDVI: {area.ndvi}</p>
                  </div>
                </div>
              </button>

              <div
                className="absolute transform -translate-x-1/2 pointer-events-none"
                style={{
                  top: `calc(${area.position.top} + 3rem)`,
                  left: area.position.left,
                }}
              >
                <div className="bg-card/90 backdrop-blur-sm border border-border rounded px-2 py-1 shadow-sm">
                  <p className="text-xs font-medium whitespace-nowrap">{area.name.split(" - ")[1]}</p>
                  <p className="text-xs text-muted-foreground">{area.coordinates}</p>
                </div>
              </div>
            </div>
          ))}

          {layers.find((l) => l.id === "projects")?.enabled && (
            <>
              <div className="absolute top-[35%] left-[50%] w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="absolute top-[55%] left-[25%] w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="absolute top-[60%] left-[70%] w-3 h-3 bg-primary rounded-full animate-pulse" />
            </>
          )}
        </div>

        {showLayers && (
          <Card className="absolute top-4 left-4 w-72 sm:w-80 shadow-lg max-h-[calc(100%-2rem)] overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <CardTitle className="text-base">Map Layers</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowLayers(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Toggle data overlays</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                    <Label htmlFor={layer.id} className="text-sm cursor-pointer">
                      {layer.name}
                    </Label>
                  </div>
                  <Switch id={layer.id} checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!showLayers && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 left-4 shadow-lg"
            onClick={() => setShowLayers(true)}
          >
            <Layers className="h-4 w-4" />
          </Button>
        )}

        <Card className="absolute bottom-4 left-4 shadow-lg hidden sm:block">
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-xs font-medium mb-2">NDVI Scale</p>
              <div className="flex items-center gap-2">
                <div className="flex h-3 w-32 rounded-full overflow-hidden">
                  <div className="flex-1 bg-destructive" />
                  <div className="flex-1 bg-orange-500" />
                  <div className="flex-1 bg-accent" />
                  <div className="flex-1 bg-primary" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedArea && (
          <Card className="absolute top-4 right-4 w-80 sm:w-96 shadow-lg max-h-[calc(100%-2rem)] overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <CardTitle className="text-base">Area Details</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedArea(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1">{selectedArea.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedArea.coordinates}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">NDVI Index</p>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold">{selectedArea.ndvi}</div>
                    <Badge variant={selectedArea.ndvi < 0.4 ? "destructive" : "default"}>
                      {selectedArea.ndvi < 0.4 ? "Poor" : "Good"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Erosion Risk</p>
                  <Badge variant={selectedArea.erosionRisk === "High" ? "destructive" : "secondary"}>
                    {selectedArea.erosionRisk}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Land Use</p>
                  <p className="text-sm font-medium">{selectedArea.landUse}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Soil Health</p>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold">{selectedArea.soilHealth}%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" size="sm" onClick={handleCreatePlan}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Restoration Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" className="shadow-lg" onClick={handleZoomIn} disabled={zoom >= 2}>
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" className="shadow-lg" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <Minus className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 shadow-lg gap-2"
          onClick={() => setShowSearchDialog(true)}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search Location</span>
        </Button>
      </div>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Restoration Plan</DialogTitle>
            <DialogDescription>Set up a new restoration project for {selectedArea?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <h4 className="font-semibold text-sm">Area Information</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Location</p>
                  <p className="font-medium">{selectedArea?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Coordinates</p>
                  <p className="font-medium">{selectedArea?.coordinates}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Current NDVI</p>
                  <p className="font-medium">{selectedArea?.ndvi}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Erosion Risk</p>
                  <p className="font-medium">{selectedArea?.erosionRisk}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (months)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional project details..."
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-primary">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on the area's NDVI of {selectedArea?.ndvi}, we recommend focusing on soil restoration and
                    native vegetation planting. Estimated success rate:{" "}
                    {selectedArea && selectedArea.ndvi < 0.3 ? 75 : selectedArea && selectedArea.ndvi < 0.4 ? 82 : 88}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={isSaving || !projectName}>
              {isSaving ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <DialogTitle>Restoration Plan Created!</DialogTitle>
            </div>
            <DialogDescription>Your restoration plan has been successfully saved to the database.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Project Name</p>
                <p className="font-semibold">{projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{selectedArea?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Budget</p>
                  <p className="font-medium">${Number.parseInt(budget).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium">{duration} months</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Where to find your plan:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-3 rounded-lg border border-border">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dashboard Overview</p>
                    <p className="text-xs text-muted-foreground">View all your projects in the main dashboard</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg border border-border">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Restoration Planner</p>
                    <p className="text-xs text-muted-foreground">Continue planning and add more details</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg border border-border">
                  <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Management</p>
                    <p className="text-xs text-muted-foreground">Export and manage project data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSuccessDialogClose} className="w-full sm:w-auto bg-transparent">
              Create Another Plan
            </Button>
            <Button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
              <ExternalLink className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
