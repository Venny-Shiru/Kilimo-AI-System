import type { NextRequest } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const signatureHeader = req.headers.get("x-supabase-signature") || req.headers.get("x-supabase-signature-256")
    const secret = process.env.SUPABASE_WEBHOOK_SECRET

    if (secret) {
      if (!signatureHeader) return new Response("Missing signature", { status: 401 })

      const hmac = createHmac("sha256", secret).update(bodyText).digest("hex")

      // timingSafeEqual requires buffers of same length
      const sigBuf = Buffer.from(signatureHeader, "utf8")
      const hmacBuf = Buffer.from(hmac, "utf8")
      if (sigBuf.length !== hmacBuf.length || !timingSafeEqual(sigBuf, hmacBuf)) {
        return new Response("Invalid signature", { status: 401 })
      }
    }

    const payload = JSON.parse(bodyText)

    // Supabase auth webhook payloads vary; we handle common shapes
    const event = payload?.type ?? payload?.event ?? payload?.trigger

    if (event !== "user.created" && event !== "auth.user.created") {
      return new Response("Event ignored", { status: 200 })
    }

    const user = payload?.user ?? payload?.record ?? payload?.data ?? payload?.new ?? payload

    const userId = user?.id
    const email = user?.email

    if (!userId) return new Response("No user id", { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Missing Supabase URL or service role key; cannot upsert profile")
      return new Response("Missing server keys", { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: email,
        full_name: user?.user_metadata?.full_name ?? user?.full_name ?? null,
        organization: user?.user_metadata?.organization ?? user?.organization ?? null,
        role: "user",
      },
      { onConflict: "id" },
    )

    if (error) {
      console.error("Failed to upsert profile", error)
      return new Response("Upsert failed", { status: 500 })
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response("Error", { status: 500 })
  }
}
