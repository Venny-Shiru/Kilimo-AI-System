import { MapViewer } from "@/components/map-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Layers, TrendingUp, AlertTriangle } from "lucide-react"

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Interactive Map Viewer</h1>
        <p className="text-muted-foreground">
          Explore environmental data, monitor degradation patterns, and identify areas for restoration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Monitored Areas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Active monitoring zones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Data Layers</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">Available overlays</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg NDVI</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.38</div>
            <p className="text-xs text-muted-foreground mt-1">Vegetation health index</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">How to Use the Map</CardTitle>
          <CardDescription>Interactive features and controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Search Locations</p>
                <p className="text-xs text-muted-foreground">Use the search button to find specific regions by name</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                2
              </div>
              <div>
                <p className="font-medium text-sm">View Area Details</p>
                <p className="text-xs text-muted-foreground">
                  Click on markers to view detailed environmental metrics and location info
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Toggle Data Layers</p>
                <p className="text-xs text-muted-foreground">
                  Use the layers panel to show/hide different environmental data overlays
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                4
              </div>
              <div>
                <p className="font-medium text-sm">Create Restoration Plans</p>
                <p className="text-xs text-muted-foreground">
                  Click on a marker and use "Create Plan" to start a new restoration project
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MapViewer />
    </div>
  )
}
