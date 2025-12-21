import { describe, expect, it } from 'vitest'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const { GET } = await import('../../app/api/health/route')
    const res = await GET()
    expect(res).toBeInstanceOf(Response)
    expect(res.status).toBe(200)
    const body = JSON.parse(await res.text())
    expect(body).toEqual({ status: 'ok' })
  })
})
