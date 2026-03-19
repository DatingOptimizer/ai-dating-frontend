import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, rewriteBio, rankPhotos, saveBio, deleteBio, saveStarter, deleteStarter, getHistory, generateOpeners } from '@/lib/api'

// Mock supabase to return a fake token
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}))

describe('ApiError', () => {
  it('has name ApiError', () => {
    const err = new ApiError('oops', { status: 500, url: '/test' })
    expect(err.name).toBe('ApiError')
    expect(err.message).toBe('oops')
    expect(err.status).toBe(500)
    expect(err.url).toBe('/test')
  })

  it('stores optional details', () => {
    const err = new ApiError('bad', { status: 400, url: '/x', details: { field: 'bio' } })
    expect(err.details).toEqual({ field: 'bio' })
  })

  it('is an instance of Error', () => {
    const err = new ApiError('test', { status: 0, url: '/' })
    expect(err instanceof Error).toBe(true)
  })
})

describe('API functions (fetch mocked)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockFetchOk(body: unknown) {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  }

  function mockFetchError(status: number, body?: unknown) {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(body ?? { message: 'error' }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })
    )
  }

  it('rewriteBio sends POST with bio and tone', async () => {
    const mockResponse = { originalBio: 'old', rewrittenBios: ['new1', 'new2'], tone: 'casual' }
    mockFetchOk(mockResponse)

    const result = await rewriteBio({ bio: 'old', tone: 'casual' })

    expect(result).toEqual(mockResponse)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/rewrite-bio')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ bio: 'old', tone: 'casual' })
  })

  it('rewriteBio includes Authorization header when session exists', async () => {
    mockFetchOk({ originalBio: '', rewrittenBios: [], tone: 'casual' })
    await rewriteBio({ bio: 'test', tone: 'casual' })

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer test-token')
  })

  it('rewriteBio throws ApiError on non-ok response', async () => {
    mockFetchError(422, { message: 'invalid' })

    await expect(rewriteBio({ bio: '', tone: 'casual' })).rejects.toBeInstanceOf(ApiError)
    await expect(rewriteBio({ bio: '', tone: 'casual' })).rejects.toMatchObject({ status: 422 })
  })

  it('getHistory sends GET to /api/profile/history', async () => {
    const mockHistory = { savedBios: [], savedStarters: [] }
    mockFetchOk(mockHistory)

    const result = await getHistory()

    expect(result).toEqual(mockHistory)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/history')
    expect(init?.method).toBeUndefined() // default GET
  })

  it('saveBio sends POST with content', async () => {
    const saved = { id: '1', content: 'my bio', createdAt: '2026-01-01' }
    mockFetchOk(saved)

    const result = await saveBio('my bio')

    expect(result).toEqual(saved)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/history/bio')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toEqual({ content: 'my bio' })
  })

  it('deleteBio sends DELETE to correct URL', async () => {
    mockFetchOk({})
    await deleteBio('abc-123')

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/history/bio/abc-123')
    expect(init?.method).toBe('DELETE')
  })

  it('saveStarter sends POST with content', async () => {
    const saved = { id: '2', content: 'hey there!', createdAt: '2026-01-01' }
    mockFetchOk(saved)

    const result = await saveStarter('hey there!')

    expect(result).toEqual(saved)
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/history/starter')
  })

  it('deleteStarter sends DELETE to correct URL', async () => {
    mockFetchOk({})
    await deleteStarter('xyz-456')

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/history/starter/xyz-456')
    expect(init?.method).toBe('DELETE')
  })

  it('generateOpeners sends POST with bio and tone', async () => {
    const mockResponse = { bio: 'test', starters: ['hi!', 'hey!'], tone: 'casual' }
    mockFetchOk(mockResponse)

    const result = await generateOpeners({ bio: 'test', tone: 'casual' })

    expect(result).toEqual(mockResponse)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/generate-openers')
    expect(init?.method).toBe('POST')
  })

  it('throws ApiError with status 0 on network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    await expect(rewriteBio({ bio: 'test', tone: 'casual' })).rejects.toMatchObject({
      status: 0,
    })
  })

  it('rankPhotos sends POST with multipart/form-data to rank-photos endpoint', async () => {
    const mockResponse = {
      rankedPhotos: [
        { photoName: 'a.jpg', rank: 1, score: 90, reasoning: 'Great shot', base64Image: null },
        { photoName: 'b.jpg', rank: 2, score: 70, reasoning: 'Decent', base64Image: null },
      ]
    }
    mockFetchOk(mockResponse)

    const files = [
      new File(['img'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['img'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    const result = await rankPhotos(files)

    expect(result).toEqual(mockResponse)
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/api/profile/rank-photos')
    expect(init?.method).toBe('POST')
    // Should use FormData, not JSON
    expect(init?.body).toBeInstanceOf(FormData)
    expect(init?.headers).not.toHaveProperty('Content-Type') // FormData sets its own boundary
  })

  it('rankPhotos throws ApiError on failure', async () => {
    mockFetchError(413, { message: 'File too large' })
    const files = [new File(['img'], 'a.jpg', { type: 'image/jpeg' })]

    await expect(rankPhotos(files)).rejects.toBeInstanceOf(ApiError)
    await expect(rankPhotos(files)).rejects.toMatchObject({ status: 413 })
  })

  it('throws ApiError with timeout message on AbortError', async () => {
    const abortErr = new DOMException('Aborted', 'AbortError')
    vi.mocked(fetch).mockRejectedValue(abortErr)

    await expect(rewriteBio({ bio: 'test', tone: 'casual' })).rejects.toMatchObject({
      message: expect.stringContaining('timed out'),
      status: 0,
    })
  })
})
