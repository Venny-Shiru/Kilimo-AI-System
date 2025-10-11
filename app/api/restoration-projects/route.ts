import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let query = supabase
      .from("restoration_projects")
      .select(`
        *,
        restoration_techniques(*),
        plant_species(*)
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching restoration projects:", error)
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

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Insert project
    const { data: project, error: projectError } = await supabase
      .from("restoration_projects")
      .insert([
        {
          ...body,
          created_by: user.id,
        },
      ])
      .select()
      .single()

    if (projectError) {
      console.error("[v0] Error creating restoration project:", projectError)
      return NextResponse.json({ error: projectError.message }, { status: 500 })
    }

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
