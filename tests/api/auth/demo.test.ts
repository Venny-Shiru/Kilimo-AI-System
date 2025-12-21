import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks must be declared before importing the route
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

const NextResponseMock = {
  next: () => ({
    status: 200,
    cookies: { set: vi.fn() },
  }),
}
vi.mock('next/server', () => ({ NextResponse: NextResponseMock }))

describe('POST /api/auth/demo', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    // Default: allow demo in tests
    process.env.NEXT_PUBLIC_ALLOW_DEMO = 'true'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    // Ensure demo credentials are present so the route proceeds to signInWithPassword
    process.env.NEXT_PUBLIC_DEMO_EMAIL = 'demo@example.com'
    process.env.NEXT_PUBLIC_DEMO_PASSWORD = 'demo-password'
  })

  afterEach(() => {
    process.env = originalEnv
    vi.resetAllMocks()
  })

  it('returns 403 when demo not allowed', async () => {
    process.env.NEXT_PUBLIC_ALLOW_DEMO = 'false'
    ;(process.env as any).NODE_ENV = 'production'

    const { POST } = await import('../../../app/api/auth/demo/route')
    const res = await POST(new Request('http://localhost'))
    expect(res.status).toBe(403)
  })

  it('returns 500 when supabase config missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const { POST } = await import('../../../app/api/auth/demo/route')
    const res = await POST(new Request('http://localhost'))
    expect(res.status).toBe(500)
  })

  it('returns 400 when signInWithPassword returns error', async () => {
    const { createServerClient } = await import('@supabase/ssr') as any
    createServerClient.mockImplementation(() => ({
      auth: { signInWithPassword: async () => ({ data: null, error: { message: 'Bad credentials' } }) },
    }))

    const { POST } = await import('../../../app/api/auth/demo/route')
    const res = await POST(new Request('http://localhost'))
    expect(res.status).toBe(400)
  })

  it('returns 200 when signInWithPassword succeeds', async () => {
    const { createServerClient } = await import('@supabase/ssr') as any
    createServerClient.mockImplementation(() => ({
      auth: { signInWithPassword: async () => ({ data: { user: { id: 'demo' } }, error: null }) },
    }))

    const { POST } = await import('../../../app/api/auth/demo/route')
    const res = await POST(new Request('http://localhost'))
    expect(res.status).toBe(200)
  })
})
