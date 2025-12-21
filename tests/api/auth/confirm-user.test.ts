import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@supabase/ssr', () => ({ createServerClient: vi.fn() }))

beforeEach(() => {
  process.env.NEXT_PUBLIC_ALLOW_DEMO = 'true'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
})

describe('POST /api/auth/confirm-user', () => {
  it('returns 400 when no email provided', async () => {
    const { POST } = await import('../../../app/api/auth/confirm-user/route')
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when profile not found', async () => {
    const { createServerClient } = await import('@supabase/ssr') as any
    createServerClient.mockImplementation(() => ({
      from: () => ({ select: () => ({ eq: () => ({ limit: () => ({ single: async () => ({ data: null, error: { message: 'not found' } }) }) }) }) }),
    }))

    const { POST } = await import('../../../app/api/auth/confirm-user/route')
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ email: 'noone@example.com' }) }))
    expect(res.status).toBe(404)
  })

  it('returns 500 when admin API not available', async () => {
    const { createServerClient } = await import('@supabase/ssr') as any
    createServerClient.mockImplementation(() => ({
      from: () => ({ select: () => ({ eq: () => ({ limit: () => ({ single: async () => ({ data: { id: 'user-id' }, error: null }) }) }) }) }),
      auth: {},
    }))

    const { POST } = await import('../../../app/api/auth/confirm-user/route')
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ email: 'someone@example.com' }) }))
    expect(res.status).toBe(500)
  })

  it('returns 200 when admin API confirms user', async () => {
    const { createServerClient } = await import('@supabase/ssr') as any
    createServerClient.mockImplementation(() => ({
      from: () => ({ select: () => ({ eq: () => ({ limit: () => ({ single: async () => ({ data: { id: 'user-id' }, error: null }) }) }) }) }),
      auth: { admin: { updateUserById: async () => ({ data: { id: 'user-id' }, error: null }) } },
    }))

    const { POST } = await import('../../../app/api/auth/confirm-user/route')
    const res = await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ email: 'someone@example.com' }) }))
    expect(res.status).toBe(200)
  })
})