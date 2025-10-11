import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams
    const regionId = searchParams.get("regionId")

    let query = supabase.from("environmental_data").select("*").order("measurement_date", { ascending: false })

    if (regionId) {
      query = query.eq("region_id", regionId)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      console.error("[v0] Error fetching environmental data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const body = await request.json()

    const { data, error } = await supabase.from("environmental_data").insert([body]).select().single()

    if (error) {
      console.error("[v0] Error inserting environmental data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
