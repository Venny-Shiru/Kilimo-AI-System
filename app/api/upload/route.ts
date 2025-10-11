import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const category = formData.get("category") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    })

    const { data, error } = await supabase
      .from("uploaded_files")
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: blob.url,
        file_size: file.size,
        file_type: file.type,
        category: category || "general",
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to save file metadata" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      file: data,
      url: blob.url,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }

    return NextResponse.json({ files: data })
  } catch (error) {
    console.error("[v0] Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}
