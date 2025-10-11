"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, MapPin, TrendingUp, DollarSign, Calendar, CheckCircle2, ExternalLink } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Step = "select" | "analyze" | "recommend" | "plan" | "review"

interface EnvironmentalData {
  id: string
  region_id: string
  region_name: string
  ndvi_value: number
  degradation_level: string
  erosion_risk_level: string
  soil_health_score: number
}

export function RestorationPlanner() {
  const [currentStep, setCurrentStep] = useState<Step>("select")
  const [selectedArea, setSelectedArea] = useState("")
  const [selectedRegionId, setSelectedRegionId] = useState("")
  const [projectName, setProjectName] = useState("")
  const [budget, setBudget] = useState("500000")
  const [duration, setDuration] = useState("24")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null)
  const [realAreas, setRealAreas] = useState<EnvironmentalData[]>([])
  const [isLoadingAreas, setIsLoadingAreas] = useState(true)
  const [selectedAreaData, setSelectedAreaData] = useState<EnvironmentalData | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const steps = [
    { id: "select", label: "Select Area", icon: MapPin },
    { id: "analyze", label: "Analyze", icon: TrendingUp },
    { id: "recommend", label: "AI Recommendations", icon: Sparkles },
    { id: "plan", label: "Resource Planning", icon: DollarSign },
    { id: "review", label: "Review & Save", icon: CheckCircle2 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  useEffect(() => {
    const fetchDegradedAreas = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("environmental_data")
        .select("*")
        .in("degradation_level", ["high", "severe"])
        .order("ndvi_value", { ascending: true })
        .limit(10)

      if (data && data.length > 0) {
        setRealAreas(data)
      }
      setIsLoadingAreas(false)
    }

    fetchDegradedAreas()
  }, [])

  const handleSavePlan = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save a restoration plan",
          variant: "destructive",
        })
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

      const { data, error } = await supabase
        .from("restoration_projects")
        .insert({
          project_name: projectName || `${selectedArea} Restoration`,
          region_id: selectedRegionId || `region-${Date.now()}`,
          region_name: selectedArea,
          area_hectares: 450,
          budget_allocated: Number.parseFloat(budget),
          budget_spent: 0,
          start_date: startDate.toISOString().split("T")[0],
          estimated_completion_date: estimatedCompletionDate.toISOString().split("T")[0],
          status: "planned",
          success_rate_estimate: selectedAreaData ? Math.round((selectedAreaData.ndvi_value || 0.3) * 100 + 20) : 82,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setSavedProjectId(data.id)
      setShowSuccessDialog(true)

      toast({
        title: "Success!",
        description: "Restoration plan saved successfully",
      })
    } catch (error) {
      console.error("Error saving restoration plan:", error)
      toast({
        title: "Error",
        description: "Failed to save restoration plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    setCurrentStep("select")
    setSelectedArea("")
    setSelectedRegionId("")
    setProjectName("")
    setBudget("500000")
    setDuration("24")
    setNotes("")
    setSavedProjectId(null)
    setSelectedAreaData(null)
    router.refresh()
  }

  const priorityAreas =
    realAreas.length > 0
      ? realAreas.slice(0, 3).map((area, index) => ({
          name: area.region_name,
          regionId: area.region_id,
          area: "450 km²",
          ndvi: area.ndvi_value || 0.28,
          risk: area.degradation_level === "severe" ? "Critical" : "High",
          priority: index + 1,
          data: area,
        }))
      : [
          {
            name: "Northern Plains - Sector 12",
            regionId: "sector-12-north",
            area: "450 km²",
            ndvi: 0.28,
            risk: "Critical",
            priority: 1,
            data: null,
          },
          {
            name: "Southern Hills - Sector 5",
            regionId: "sector-5-south",
            area: "320 km²",
            ndvi: 0.32,
            risk: "High",
            priority: 2,
            data: null,
          },
          {
            name: "Eastern Valley - Sector 8",
            regionId: "sector-8-east",
            area: "280 km²",
            ndvi: 0.35,
            risk: "High",
            priority: 3,
            data: null,
          },
        ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Restoration Planning Tool</h2>
        <p className="text-muted-foreground">AI-powered restoration planning and resource allocation</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = index < currentStepIndex

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "bg-primary border-primary text-primary-foreground"
                          : isCompleted
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs mt-2 text-center font-medium">{step.label}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${index < currentStepIndex ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {currentStep === "select" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Area for Restoration</CardTitle>
            <CardDescription>Choose from high-priority degraded areas or select custom location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAreas && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading degraded areas...</p>
              </div>
            )}

            {!isLoadingAreas && (
              <Tabs defaultValue="priority">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="priority">High Priority Areas</TabsTrigger>
                  <TabsTrigger value="custom">Custom Selection</TabsTrigger>
                </TabsList>

                <TabsContent value="priority" className="space-y-3 mt-4">
                  {priorityAreas.map((area) => (
                    <button
                      key={area.name}
                      onClick={() => {
                        setSelectedArea(area.name)
                        setSelectedRegionId(area.regionId)
                        setSelectedAreaData(area.data)
                        setCurrentStep("analyze")
                      }}
                      className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Priority #{area.priority}
                            </Badge>
                            <Badge variant={area.risk === "Critical" ? "destructive" : "secondary"}>{area.risk}</Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{area.name}</h4>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Area: {area.area}</span>
                            <span>NDVI: {area.ndvi.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Location Name</Label>
                    <Input placeholder="Enter location name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordinates</Label>
                    <Input placeholder="e.g., 34.5°N, 45.2°E" />
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedArea("Custom Location")
                      setSelectedRegionId(`custom-${Date.now()}`)
                      setCurrentStep("analyze")
                    }}
                    className="w-full"
                  >
                    Continue with Custom Location
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === "analyze" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Context</CardTitle>
              <CardDescription>{selectedArea}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vegetation Health (NDVI)</span>
                  <span className="font-medium">{selectedAreaData?.ndvi_value.toFixed(2) || "0.28"}</span>
                </div>
                <Progress value={(selectedAreaData?.ndvi_value || 0.28) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Soil Health</span>
                  <span className="font-medium">{selectedAreaData?.soil_health_score || 42}%</span>
                </div>
                <Progress value={selectedAreaData?.soil_health_score || 42} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Water Availability</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Climate Zone</span>
                  <span className="font-medium">Semi-Arid</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Soil Type</span>
                  <span className="font-medium">Sandy Loam</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Erosion Risk</span>
                  <Badge variant={selectedAreaData?.erosion_risk_level === "high" ? "destructive" : "secondary"}>
                    {selectedAreaData?.erosion_risk_level || "High"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>Degradation trends over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">2020</p>
                    <p className="text-xs text-muted-foreground">NDVI: 0.52</p>
                  </div>
                  <Badge variant="outline">Healthy</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">2022</p>
                    <p className="text-xs text-muted-foreground">NDVI: 0.38</p>
                  </div>
                  <Badge variant="secondary">Declining</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <p className="text-sm font-medium">2024</p>
                    <p className="text-xs text-muted-foreground">
                      NDVI: {selectedAreaData?.ndvi_value.toFixed(2) || "0.28"}
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Degradation rate: <span className="text-destructive font-medium">-46% over 4 years</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Button onClick={() => setCurrentStep("recommend")} className="w-full">
              Generate AI Recommendations
            </Button>
          </div>
        </div>
      )}

      {currentStep === "recommend" && (
        <div className="space-y-4">
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </div>
              <CardDescription>Optimized restoration strategies for {selectedArea}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Recommended Native Plant Species</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    { name: "Acacia tortilis", success: 85, reason: "Drought-resistant, nitrogen-fixing" },
                    { name: "Prosopis cineraria", success: 78, reason: "Deep root system, erosion control" },
                    { name: "Ziziphus mauritiana", success: 72, reason: "Hardy, provides ground cover" },
                    { name: "Salvadora persica", success: 68, reason: "Salt-tolerant, fast-growing" },
                  ].map((plant) => (
                    <div key={plant.name} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{plant.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {plant.success}% success
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{plant.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Soil Conservation Techniques</h4>
                <div className="space-y-2">
                  {[
                    "Contour plowing to reduce water runoff",
                    "Mulching with organic matter to improve soil structure",
                    "Installation of check dams for erosion control",
                    "Terracing on slopes to prevent soil loss",
                  ].map((technique, i) => (
                    <div key={i} className="flex items-start gap-2 p-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{technique}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Projected Success Rate</h4>
                </div>
                <p className="text-2xl font-bold text-primary mb-1">
                  {selectedAreaData ? Math.round((selectedAreaData.ndvi_value || 0.3) * 100 + 20) : 82}%
                </p>
                <p className="text-xs text-muted-foreground">Based on similar projects in comparable conditions</p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => setCurrentStep("plan")} className="w-full">
            Continue to Resource Planning
          </Button>
        </div>
      )}

      {currentStep === "plan" && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation & Timeline</CardTitle>
            <CardDescription>Plan budget and implementation phases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Total Budget (USD)</Label>
                <Input type="number" placeholder="500000" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Project Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Budget Breakdown</h4>
              <div className="space-y-3">
                {[
                  { category: "Plant Materials & Seeds", amount: 150000, percentage: 30 },
                  { category: "Labor & Implementation", amount: 175000, percentage: 35 },
                  { category: "Equipment & Tools", amount: 75000, percentage: 15 },
                  { category: "Monitoring & Maintenance", amount: 75000, percentage: 15 },
                  { category: "Contingency", amount: 25000, percentage: 5 },
                ].map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">${item.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Implementation Phases</h4>
              <div className="space-y-3">
                {[
                  { phase: "Phase 1: Site Preparation", duration: "Months 1-3", status: "planned" },
                  { phase: "Phase 2: Initial Planting", duration: "Months 4-8", status: "planned" },
                  { phase: "Phase 3: Soil Conservation", duration: "Months 6-12", status: "planned" },
                  { phase: "Phase 4: Monitoring & Maintenance", duration: "Months 12-24", status: "planned" },
                ].map((phase, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{phase.phase}</p>
                      <p className="text-xs text-muted-foreground">{phase.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setCurrentStep("review")} className="w-full">
              Review Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restoration Plan Summary</CardTitle>
              <CardDescription>Review and save your restoration plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Target Area</p>
                  <p className="font-semibold">{selectedArea}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                  <p className="font-semibold">${Number.parseInt(budget).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold">{duration} months</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                  <p className="font-semibold text-primary">
                    {selectedAreaData ? Math.round((selectedAreaData.ndvi_value || 0.3) * 100 + 20) : 82}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add any additional notes or requirements"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setCurrentStep("select")} variant="outline" className="flex-1">
                  Start New Plan
                </Button>
                <Button onClick={handleSavePlan} className="flex-1" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Restoration Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <p className="font-semibold">{projectName || `${selectedArea} Restoration`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">{selectedArea}</p>
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
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analytics Page</p>
                    <p className="text-xs text-muted-foreground">Track progress and view detailed metrics</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg border border-border">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
    </div>
  )
}
