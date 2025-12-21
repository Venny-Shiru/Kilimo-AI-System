import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = body?.email

  if (!email) return new Response('Missing email', { status: 400 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Missing Supabase URL or service role key; cannot confirm user')
    return new Response('Missing server keys', { status: 500 })
  }

  // Only allow this in development or when explicitly enabled for tests
  const allowConfirm = process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true' || process.env.ALLOW_DEMO === 'true' || process.env.NODE_ENV === 'development'
  if (!allowConfirm) {
    return new Response('Not allowed', { status: 403 })
  }

  const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // no-op
      },
    },
  })

  try {
    // Find profile to retrieve user id inserted by webhook or signup
    const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('email', email).limit(1).single()
    if (profileError || !profile) {
      console.warn('Profile not found for email', email, profileError)
      return new Response('User not found', { status: 404 })
    }
    const userId = profile.id

    // Attempt to use admin API to update user's email confirmation
    // supabase-js v2 provides auth.admin.updateUserById
    // If not available, return an error
    // @ts-ignore
    if (!supabase.auth?.admin?.updateUserById) {
      console.error('Admin API not available in this environment')
      return new Response('Admin API not available', { status: 500 })
    }

    // Update user
    // @ts-ignore - admin API exists at runtime; the TypeScript types may not include this property
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      // Supabase admin API accepts `email_confirmed_at` to mark email as confirmed
      // @ts-ignore
      email_confirmed_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Failed to confirm user', error)
      return new Response('Failed to confirm user', { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Confirm user error', err)
    return new Response('Error', { status: 500 })
  }
}
