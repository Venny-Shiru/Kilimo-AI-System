import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // If Supabase is not configured, skip creating the client and return early.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Do not block; tests and dev may run without Supabase configured.
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Refresh session if expired, but do not block on slow Supabase responses.
  // Only attempt refresh if a refresh token is present.
  const refreshToken = request.cookies.get("sb-refresh-token")?.value
  if (refreshToken) {
    try {
      // Race with a 5s timeout to prevent middleware from hanging
      await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Session refresh timeout")), 5000)),
      ])
    } catch (err) {
      // Log but do not throw; session refresh failure should not block page load
      console.warn("Session refresh failed in middleware:", err instanceof Error ? err.message : String(err))
    }
  }

  return supabaseResponse
}
