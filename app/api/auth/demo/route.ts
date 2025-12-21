import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: Request) {
  // Only allow demo sign-in in development or when explicitly enabled
  const allowDemo =
    process.env.NEXT_PUBLIC_ALLOW_DEMO === "true" ||
    process.env.ALLOW_DEMO === "true" ||
    process.env.NODE_ENV === "development"

  if (!allowDemo) {
    return new Response("Demo not allowed", { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase URL or service role key; cannot perform demo sign-in")
    return new Response("Server not configured", { status: 500 })
  }

  // Demo credentials should be configured as env vars for safety
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? process.env.DEMO_EMAIL
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? process.env.DEMO_PASSWORD

  if (!demoEmail || !demoPassword) {
    console.error("Demo credentials not configured")
    return new Response("Demo not configured", { status: 500 })
  }

  // Prepare a response so we can attach cookies set by the server client
  let demoResponse = NextResponse.next()

  const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        // For demo sign-in we don't need existing cookies
        return []
      },
      setAll(cookiesToSet) {
        // Attach cookies to the outgoing response so browser receives session
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            // NextResponse.cookies.set will accept the cookie options
            // @ts-ignore - runtime object
            demoResponse.cookies.set(name, value, options)
          } catch (err) {
            console.warn("Failed setting cookie on demo response", err)
          }
        })
      },
    },
  })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    })

    if (error) {
      console.error("Demo sign-in failed:", error)
      return new Response(error.message, { status: 400 })
    }

    // If sign-in succeeds the cookies were attached; return 200
    return demoResponse
  } catch (err) {
    console.error("Demo sign-in error:", err)
    return new Response("Demo sign-in error", { status: 500 })
  }
}
