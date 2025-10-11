import { type NextRequest, NextResponse } from "next/server"
import { generateRestorationRecommendations } from "@/lib/ai/generate-recommendations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { regionName, ndviValue, soilHealthScore, erosionRiskLevel, degradationLevel, areaHectares, climate } = body

    if (
      !regionName ||
      ndviValue === undefined ||
      !soilHealthScore ||
      !erosionRiskLevel ||
      !degradationLevel ||
      !areaHectares
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const recommendations = await generateRestorationRecommendations({
      regionName,
      ndviValue,
      soilHealthScore,
      erosionRiskLevel,
      degradationLevel,
      areaHectares,
      climate,
    })

    return NextResponse.json({ data: recommendations })
  } catch (error) {
    console.error("[v0] Error generating recommendations:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 })
  }
}
