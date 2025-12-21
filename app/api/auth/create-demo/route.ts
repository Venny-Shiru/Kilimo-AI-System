import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  // Only allow demo creation in development or when explicitly enabled
  const allowDemoCreation =
    process.env.NEXT_PUBLIC_ALLOW_DEMO === 'true' ||
    process.env.ALLOW_DEMO === 'true' ||
    process.env.NODE_ENV === 'development'

  if (!allowDemoCreation) {
    return new Response('Demo creation not allowed', { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or service role key; cannot create demo user')
    return new Response('Server not configured', { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const email = body?.email ?? process.env.NEXT_PUBLIC_DEMO_EMAIL ?? process.env.DEMO_EMAIL
  const password = body?.password ?? process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? process.env.DEMO_PASSWORD
  const full_name = body?.full_name ?? 'Demo User'
  const organization = body?.organization ?? 'Demo Organization'

  if (!email || !password) {
    return new Response('Missing demo email or password', { status: 400 })
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
    // If profile exists, treat as idempotent
    const { data: existingProfile, error: profileErr } = await supabase.from('profiles').select('id').eq('email', email).limit(1).maybeSingle()
    if (profileErr) console.warn('Profile lookup error', profileErr)

    if (existingProfile && existingProfile.id) {
      return NextResponse.json({ ok: true, message: 'Demo account already exists' })
    }

    // Create user via admin API
    // @ts-ignore - admin API may exist at runtime
    if (!supabase.auth?.admin?.createUser) {
      console.error('Admin createUser API not available')
      return new Response('Admin API not available', { status: 500 })
    }

    let userId: string | null = null

    // Try to create user
    // @ts-ignore
    const { data: createdUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, organization },
    })

    if (createErr) {
      if (createErr.message?.includes('already been registered') || createErr.code === 'email_exists') {
        // User already exists, try to get the user id from admin list
        // @ts-ignore
        const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers()
        if (listErr || !usersData?.users) {
          console.error('Failed to list users', listErr)
          return new Response('Failed to find existing user', { status: 500 })
        }
        const existingUser = usersData.users.find(u => u.email === email)
        if (!existingUser) {
          console.error('No user found with email', email)
          return new Response('No user id for existing user', { status: 500 })
        }
        userId = existingUser.id
      } else {
        console.error('Failed to create demo user', createErr)
        return new Response('Failed to create demo user', { status: 500 })
      }
    } else {
      userId = createdUser.user?.id
      if (!userId) {
        console.error('No user id returned after creating demo user')
        return new Response('No user id', { status: 500 })
      }
    }

    // Insert profile row (idempotent insert)
    const { error: insertErr } = await supabase.from('profiles').insert([
      {
        id: userId,
        email,
        full_name,
        organization,
        role: 'viewer',
      },
    ])

    if (insertErr) {
      // If unique violation, ignore
      console.warn('Profile insert error (may already exist)', insertErr)
    }

    // Optionally auto-confirm if allowed
    const allowConfirm = process.env.ALLOW_AUTO_CONFIRM === 'true' || process.env.NODE_ENV === 'development'
    if (allowConfirm) {
      // @ts-ignore
      if (supabase.auth?.admin?.updateUserById) {
        try {
          // @ts-ignore
          await supabase.auth.admin.updateUserById(userId, { email_confirmed_at: new Date().toISOString() })
        } catch (err) {
          console.warn('Auto-confirm failed', err)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Create demo user error', err)
    return new Response('Error', { status: 500 })
  }
}
