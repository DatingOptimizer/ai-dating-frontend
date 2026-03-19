export type RewriteBioTone = 'casual' | 'bold' | 'polite' | 'humorous' | 'warm'

export interface RewriteBioRequest {
  bio: string
  tone: RewriteBioTone
}

export interface RewriteBioResponse {
  originalBio: string
  rewrittenBios: string[]
  tone: string
}

export interface RankedPhoto {
  photoName: string
  rank: number
  score: number
  reasoning: string
  base64Image: string | null
}

export interface RankPhotosResponse {
  rankedPhotos: RankedPhoto[]
}

export type GenerateOpenersTone = 'casual' | 'bold' | 'polite' | 'humorous' | 'warm'

export interface GenerateOpenersRequest {
  bio: string
  tone: GenerateOpenersTone
}

export interface GenerateOpenersResponse {
  bio: string
  starters: string[]
  tone: string
}

import { supabase } from '@/lib/supabase'

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export class ApiError extends Error {
  readonly status: number
  readonly url: string
  readonly details?: unknown

  constructor(message: string, opts: { status: number; url: string; details?: unknown }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.url = opts.url
    this.details = opts.details
  }
}

const DEFAULT_BASE_URL = 'http://localhost:8080'
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')
const TIMEOUT_MS = 15_000

function withBaseUrl(path: string) {
  if (!path.startsWith('/')) return `${BASE_URL}/${path}`
  return `${BASE_URL}${path}`
}

async function readBodySafely(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return undefined
    }
  }
  try {
    const text = await res.text()
    return text.length ? text : undefined
  } catch {
    return undefined
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function requestJson<TResponse>(
  path: string,
  init: Omit<RequestInit, 'body'> & { body?: unknown } = {},
): Promise<TResponse> {
  const url = withBaseUrl(path)

  const authHeader = await getAuthHeader()
  let res: Response
  try {
    res = await fetchWithTimeout(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(init.headers || {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    })
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? `Request timed out after ${TIMEOUT_MS}ms`
        : 'Network error'
    throw new ApiError(message, { status: 0, url, details: err })
  }

  if (!res.ok) {
    const details = await readBodySafely(res)
    throw new ApiError(`Request failed with status ${res.status}`, { status: res.status, url, details })
  }

  try {
    return (await res.json()) as TResponse
  } catch (err) {
    throw new ApiError('Failed to parse JSON response', { status: res.status, url, details: err })
  }
}

async function requestFormData<TResponse>(
  path: string,
  formData: FormData,
  init: Omit<RequestInit, 'body'> = {},
): Promise<TResponse> {
  const url = withBaseUrl(path)

  const authHeader = await getAuthHeader()
  let res: Response
  try {
    res = await fetchWithTimeout(url, { ...init, body: formData, headers: authHeader })
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'AbortError'
        ? `Request timed out after ${TIMEOUT_MS}ms`
        : 'Network error'
    throw new ApiError(message, { status: 0, url, details: err })
  }

  if (!res.ok) {
    const details = await readBodySafely(res)
    throw new ApiError(`Request failed with status ${res.status}`, { status: res.status, url, details })
  }

  try {
    return (await res.json()) as TResponse
  } catch (err) {
    throw new ApiError('Failed to parse JSON response', { status: res.status, url, details: err })
  }
}

export interface SavedItem {
  id: string
  content: string
  createdAt: string
}

export interface HistoryResponse {
  savedBios: SavedItem[]
  savedStarters: SavedItem[]
}

export async function getHistory(): Promise<HistoryResponse> {
  return await requestJson<HistoryResponse>('/api/profile/history')
}

export async function saveBio(content: string): Promise<SavedItem> {
  return await requestJson<SavedItem>('/api/profile/history/bio', { method: 'POST', body: { content } })
}

export async function deleteBio(id: string): Promise<void> {
  await requestJson<void>(`/api/profile/history/bio/${id}`, { method: 'DELETE' })
}

export async function saveStarter(content: string): Promise<SavedItem> {
  return await requestJson<SavedItem>('/api/profile/history/starter', { method: 'POST', body: { content } })
}

export async function deleteStarter(id: string): Promise<void> {
  await requestJson<void>(`/api/profile/history/starter/${id}`, { method: 'DELETE' })
}

export async function rewriteBio(req: RewriteBioRequest): Promise<RewriteBioResponse> {
  return await requestJson<RewriteBioResponse>('/api/profile/rewrite-bio', {
    method: 'POST',
    body: req,
  })
}

export async function rankPhotos(photos: File[]): Promise<RankPhotosResponse> {
  const formData = new FormData()
  for (const photo of photos) formData.append('photos', photo)

  return await requestFormData<RankPhotosResponse>('/api/profile/rank-photos', formData, {
    method: 'POST',
  })
}

export async function generateOpeners(req: GenerateOpenersRequest): Promise<GenerateOpenersResponse> {
  return await requestJson<GenerateOpenersResponse>('/api/profile/generate-openers', {
    method: 'POST',
    body: req,
  })
}
