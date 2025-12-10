import { updateSession } from "@/lib/supabase/middleware"
import { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Skip middleware for static assets, images, API routes (handle their own auth), and next internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
