import { generateText } from "ai"

export interface RestorationRecommendation {
  plantSpecies: Array<{
    name: string
    scientificName: string
    description: string
    survivalRate: number
    costPerUnit: number
    plantingSeason: string
  }>
  soilTechniques: Array<{
    name: string
    description: string
    estimatedCost: number
    priority: number
  }>
  waterManagement: Array<{
    name: string
    description: string
    estimatedCost: number
  }>
  successEstimate: number
  reasoning: string
}

export async function generateRestorationRecommendations(regionData: {
  regionName: string
  ndviValue: number
  soilHealthScore: number
  erosionRiskLevel: string
  degradationLevel: string
  areaHectares: number
  climate?: string
}): Promise<RestorationRecommendation> {
  const prompt = `You are an expert environmental scientist specializing in land restoration in Kenya and East Africa.

Given the following environmental data for a degraded area:
- Region: ${regionData.regionName}
- NDVI Value: ${regionData.ndviValue} (vegetation health indicator, -1 to 1 scale)
- Soil Health Score: ${regionData.soilHealthScore}/100
- Erosion Risk: ${regionData.erosionRiskLevel}
- Degradation Level: ${regionData.degradationLevel}
- Area Size: ${regionData.areaHectares} hectares
- Climate: ${regionData.climate || "Tropical/Sub-tropical"}

Provide detailed restoration recommendations in the following JSON format:
{
  "plantSpecies": [
    {
      "name": "Common name",
      "scientificName": "Scientific name",
      "description": "Why this species is suitable",
      "survivalRate": 85,
      "costPerUnit": 2.5,
      "plantingSeason": "March-May"
    }
  ],
  "soilTechniques": [
    {
      "name": "Technique name",
      "description": "How it helps",
      "estimatedCost": 5000,
      "priority": 1
    }
  ],
  "waterManagement": [
    {
      "name": "Water management technique",
      "description": "Implementation details",
      "estimatedCost": 3000
    }
  ],
  "successEstimate": 75,
  "reasoning": "Brief explanation of why these recommendations will work"
}

Focus on native Kenyan species and techniques appropriate for the local climate and conditions. Provide 3-5 plant species, 2-4 soil conservation techniques, and 2-3 water management strategies.`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      temperature: 0.7,
    })

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const recommendations: RestorationRecommendation = JSON.parse(jsonMatch[0])
    return recommendations
  } catch (error) {
    console.error("[v0] Error generating AI recommendations:", error)

    // Fallback recommendations if AI fails
    return {
      plantSpecies: [
        {
          name: "Acacia",
          scientificName: "Acacia tortilis",
          description: "Drought-resistant native tree excellent for soil stabilization",
          survivalRate: 80,
          costPerUnit: 2.0,
          plantingSeason: "March-May",
        },
        {
          name: "Grevillea",
          scientificName: "Grevillea robusta",
          description: "Fast-growing tree for erosion control and timber",
          survivalRate: 85,
          costPerUnit: 3.5,
          plantingSeason: "March-May",
        },
      ],
      soilTechniques: [
        {
          name: "Contour Plowing",
          description: "Plowing along contour lines to reduce water runoff and soil erosion",
          estimatedCost: 5000,
          priority: 1,
        },
        {
          name: "Mulching",
          description: "Apply organic mulch to retain moisture and improve soil structure",
          estimatedCost: 3000,
          priority: 2,
        },
      ],
      waterManagement: [
        {
          name: "Rainwater Harvesting",
          description: "Install water catchment systems to capture and store rainwater",
          estimatedCost: 8000,
        },
      ],
      successEstimate: 70,
      reasoning:
        "These recommendations are based on proven techniques for similar degradation levels in East African climates.",
    }
  }
}
