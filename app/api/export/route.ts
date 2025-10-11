import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "environmental"
    const format = searchParams.get("format") || "csv"

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "environmental":
        const { data: envData } = await supabase
          .from("environmental_data")
          .select("*")
          .order("measurement_date", { ascending: false })
          .limit(1000)
        data = envData || []
        filename = `environmental_data_${new Date().toISOString().split("T")[0]}`
        break

      case "projects":
        const { data: projectData } = await supabase
          .from("restoration_projects")
          .select("*")
          .order("created_at", { ascending: false })
        data = projectData || []
        filename = `restoration_projects_${new Date().toISOString().split("T")[0]}`
        break

      case "notifications":
        const { data: notifData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        data = notifData || []
        filename = `notifications_${new Date().toISOString().split("T")[0]}`
        break

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (format === "csv") {
      const csv = convertToCSV(data)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvRows = [headers.join(",")]

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      return typeof value === "string" ? `"${value}"` : value
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}
