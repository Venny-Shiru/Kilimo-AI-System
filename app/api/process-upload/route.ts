import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fileId, regionName, latitude, longitude } = body

    if (!fileId || !regionName || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate environmental data based on uploaded file
    // In a real app, this would parse the file and extract actual data
    const environmentalData = {
      region_id: `region-${Date.now()}`,
      region_name: regionName,
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude),
      ndvi_value: Math.random() * 0.5 + 0.2, // Random NDVI between 0.2-0.7
      soil_health_score: Math.random() * 50 + 30, // Random score 30-80
      erosion_risk_level: Math.random() > 0.5 ? "high" : "moderate",
      land_use_type: "Agricultural",
      degradation_level: Math.random() > 0.6 ? "high" : "moderate",
      data_source: "manual",
      measurement_date: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("environmental_data").insert([environmentalData]).select().single()

    if (error) {
      console.error("[v0] Error creating environmental data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
