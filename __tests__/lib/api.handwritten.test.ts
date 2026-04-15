// HANDWRITTEN TESTS

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, rewriteBio, generateOpeners, saveBio, deleteStarter, getHistory } from '@/lib/api'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'fake-jwt' } },
      }),
    },
  },
}))

describe('API layer — handwritten', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function ok(body: unknown) {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  }

  it('ApiError message shows up when you catch and log it', () => {
    // just making sure the error is readable when debugging
    const err = new ApiError('something broke', { status: 503, url: '/api/profile/rewrite-bio' })
    expect(err.toString()).toContain('something broke')
  })

  it('ApiError with no details field still works fine', () => {
    const err = new ApiError('plain error', { status: 400, url: '/test' })
    expect(err.details).toBeUndefined()
  })

  it('rewriteBio passes the bio text through exactly, no trimming or mutating', async () => {
    ok({ originalBio: '  spaced bio  ', rewrittenBios: ['better'], tone: 'casual' })
    await rewriteBio({ bio: '  spaced bio  ', tone: 'casual' })

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
    expect(body.bio).toBe('  spaced bio  ')
  })

  it('generateOpeners endpoint path is correct', async () => {
    ok({ bio: 'test', starters: ['opener1'], tone: 'warm' })
    await generateOpeners({ bio: 'test', tone: 'warm' })

    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('/api/profile/generate-openers')
  })

  it('saveBio wraps the content in a { content } object (not just the raw string)', async () => {
    ok({ id: '99', content: 'hello', createdAt: '2026-01-01' })
    await saveBio('hello')

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string)
    // backend expects { content: "..." } not just "..."
    expect(body).toEqual({ content: 'hello' })
  })

  it('deleteStarter hits the correct dynamic URL with the given id', async () => {
    ok({})
    await deleteStarter('starter-abc-999')

    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('starter-abc-999')
    expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBe('DELETE')
  })

  it('getHistory returns the full response shape without transforming it', async () => {
    const raw = {
      savedBios: [{ id: 'b1', content: 'bio text', createdAt: '2026-03-01' }],
      savedStarters: [{ id: 's1', content: 'hey!', createdAt: '2026-03-01' }],
    }
    ok(raw)
    const result = await getHistory()
    expect(result).toEqual(raw)
  })
})
