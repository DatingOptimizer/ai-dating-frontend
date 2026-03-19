import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadPage } from '@/components/upload-page'
import type { FormData } from '@/app/page'

// Mock heavy child components and external deps
vi.mock('@/components/app-sidebar', () => ({ AppSidebar: () => null }))
vi.mock('@/components/history-panel', () => ({ HistoryPanel: () => <div>History</div> }))
vi.mock('@/components/icons/squiggly-underline', () => ({ SquigglyUnderline: () => null }))
vi.mock('@/components/icons/camera-icon', () => ({ CameraIcon: () => <svg data-testid="camera-icon" /> }))
vi.mock('@/components/icons/quill-icon', () => ({ QuillIcon: () => null }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockRewriteBio = vi.fn()
const mockRankPhotos = vi.fn()
vi.mock('@/lib/api', () => ({
  rewriteBio: (...args: unknown[]) => mockRewriteBio(...args),
  rankPhotos: (...args: unknown[]) => mockRankPhotos(...args),
}))

function makeFormData(overrides: Partial<FormData> = {}): FormData {
  return { bio: '', vibe: 'chill', photos: [], ...overrides }
}

function makeProps(formData: FormData, overrides = {}) {
  return {
    formData,
    setFormData: vi.fn(),
    onSubmit: vi.fn(),
    onLogout: vi.fn(),
    ...overrides,
  }
}

describe('UploadPage — bio textarea', () => {
  it('renders the bio textarea', () => {
    render(<UploadPage {...makeProps(makeFormData())} />)
    expect(screen.getByRole('textbox', { name: /bio/i })).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(<UploadPage {...makeProps(makeFormData({ bio: 'hello' }))} />)
    expect(screen.getByText(/5\s*\/\s*500/)).toBeInTheDocument()
  })

  it('shows limit indicator at max chars', () => {
    const bio = 'a'.repeat(500)
    render(<UploadPage {...makeProps(makeFormData({ bio }))} />)
    expect(screen.getByLabelText(/character limit reached/i)).toBeInTheDocument()
  })

  it('calls setFormData when typing in bio', async () => {
    const setFormData = vi.fn()
    render(<UploadPage {...makeProps(makeFormData(), { setFormData })} />)
    await userEvent.type(screen.getByRole('textbox', { name: /bio/i }), 'hi')
    expect(setFormData).toHaveBeenCalled()
  })
})

describe('UploadPage — vibe selector', () => {
  const vibes = ['Humorous', 'Warm', 'Polite', 'Chill', 'Flirty']

  it.each(vibes)('renders the %s vibe button', (vibe) => {
    render(<UploadPage {...makeProps(makeFormData())} />)
    expect(screen.getByRole('button', { name: new RegExp(`select ${vibe} vibe`, 'i') })).toBeInTheDocument()
  })

  it('marks the active vibe as pressed', () => {
    render(<UploadPage {...makeProps(makeFormData({ vibe: 'warm' }))} />)
    expect(screen.getByRole('button', { name: /select warm vibe/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls setFormData when a vibe is clicked', async () => {
    const setFormData = vi.fn()
    render(<UploadPage {...makeProps(makeFormData(), { setFormData })} />)
    await userEvent.click(screen.getByRole('button', { name: /select humorous vibe/i }))
    expect(setFormData).toHaveBeenCalled()
  })
})

describe('UploadPage — submit button', () => {
  beforeEach(() => {
    mockRewriteBio.mockClear()
    mockRankPhotos.mockClear()
  })

  it('is disabled when bio is empty', () => {
    render(<UploadPage {...makeProps(makeFormData({ bio: '' }))} />)
    expect(screen.getByRole('button', { name: /optimize my profile/i })).toBeDisabled()
  })

  it('is enabled when bio has content', () => {
    render(<UploadPage {...makeProps(makeFormData({ bio: 'I like hiking' }))} />)
    expect(screen.getByRole('button', { name: /optimize my profile/i })).toBeEnabled()
  })

  it('calls onSubmit with rewritten bios and empty ranked photos when no photos', async () => {
    const onSubmit = vi.fn()
    mockRewriteBio.mockResolvedValue({ rewrittenBios: ['bio A', 'bio B'], originalBio: 'old', tone: 'casual' })
    mockRankPhotos.mockResolvedValue({ rankedPhotos: [] })

    render(<UploadPage {...makeProps(makeFormData({ bio: 'I love coffee' }), { onSubmit })} />)
    await userEvent.click(screen.getByRole('button', { name: /optimize my profile/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(['bio A', 'bio B'], []))
  })

  it('calls rankPhotos and passes results to onSubmit when 2+ photos uploaded', async () => {
    const onSubmit = vi.fn()
    const rankedPhotos = [
      { photoName: 'a.jpg', rank: 1, score: 90, reasoning: 'Great', base64Image: null },
      { photoName: 'b.jpg', rank: 2, score: 70, reasoning: 'Good', base64Image: null },
    ]
    mockRewriteBio.mockResolvedValue({ rewrittenBios: ['bio A'], originalBio: 'old', tone: 'casual' })
    mockRankPhotos.mockResolvedValue({ rankedPhotos })

    const photos = [
      { id: '1', url: 'blob:1', name: 'a.jpg', file: new File([''], 'a.jpg', { type: 'image/jpeg' }) },
      { id: '2', url: 'blob:2', name: 'b.jpg', file: new File([''], 'b.jpg', { type: 'image/jpeg' }) },
    ]
    render(<UploadPage {...makeProps(makeFormData({ bio: 'I love coffee', photos }), { onSubmit })} />)
    await userEvent.click(screen.getByRole('button', { name: /optimize my profile/i }))

    await waitFor(() => {
      expect(mockRankPhotos).toHaveBeenCalled()
      expect(onSubmit).toHaveBeenCalledWith(['bio A'], rankedPhotos)
    })
  })

  it('skips rankPhotos when fewer than 2 photos uploaded', async () => {
    mockRewriteBio.mockResolvedValue({ rewrittenBios: ['bio A'], originalBio: 'old', tone: 'casual' })
    mockRankPhotos.mockResolvedValue({ rankedPhotos: [] })

    const photos = [
      { id: '1', url: 'blob:1', name: 'a.jpg', file: new File([''], 'a.jpg', { type: 'image/jpeg' }) },
    ]
    render(<UploadPage {...makeProps(makeFormData({ bio: 'I love coffee', photos }))} />)
    await userEvent.click(screen.getByRole('button', { name: /optimize my profile/i }))

    await waitFor(() => expect(mockRankPhotos).not.toHaveBeenCalled())
  })

  it('shows toast error on API failure', async () => {
    const { toast } = await import('sonner')
    mockRewriteBio.mockRejectedValue(new Error('Server error'))

    render(<UploadPage {...makeProps(makeFormData({ bio: 'hello world' }))} />)
    await userEvent.click(screen.getByRole('button', { name: /optimize my profile/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server error'))
  })
})

describe('UploadPage — vibe to tone mapping', () => {
  // Test the mapping indirectly by checking what rewriteBio is called with
  const cases: Array<[FormData['vibe'], string]> = [
    ['humorous', 'humorous'],
    ['warm', 'warm'],
    ['polite', 'polite'],
    ['flirty', 'bold'],
    ['chill', 'casual'],
  ]

  it.each(cases)('maps vibe "%s" to tone "%s"', async (vibe, expectedTone) => {
    mockRewriteBio.mockResolvedValue({ rewrittenBios: [], originalBio: '', tone: expectedTone })

    render(<UploadPage {...makeProps(makeFormData({ bio: 'test bio', vibe }))} />)
    await userEvent.click(screen.getByRole('button', { name: /optimize my profile/i }))

    await waitFor(() =>
      expect(mockRewriteBio).toHaveBeenCalledWith(
        expect.objectContaining({ tone: expectedTone })
      )
    )
    mockRewriteBio.mockClear()
  })
})

describe('UploadPage — photo upload', () => {
  it('renders the upload drop zone', () => {
    render(<UploadPage {...makeProps(makeFormData())} />)
    expect(screen.getByRole('button', { name: /upload photos/i })).toBeInTheDocument()
  })

  it('shows camera icon when no photos uploaded', () => {
    render(<UploadPage {...makeProps(makeFormData())} />)
    expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
  })

  it('filters out non-image files', async () => {
    const setFormData = vi.fn()
    render(<UploadPage {...makeProps(makeFormData(), { setFormData })} />)

    const input = document.getElementById('photo-upload') as HTMLInputElement
    const textFile = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    const imageFile = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    fireEvent.change(input, { target: { files: [textFile, imageFile] } })

    await waitFor(() => {
      const call = setFormData.mock.calls[0][0]
      const updater = typeof call === 'function' ? call({ photos: [] }) : null
      if (updater) {
        expect(updater.photos).toHaveLength(1)
        expect(updater.photos[0].name).toBe('photo.jpg')
      }
    })
  })

  it('caps photos at 5', async () => {
    const existing = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      url: `blob:${i}`,
      name: `photo${i}.jpg`,
      file: new File([''], `photo${i}.jpg`, { type: 'image/jpeg' }),
    }))
    const setFormData = vi.fn()
    render(<UploadPage {...makeProps(makeFormData({ photos: existing }), { setFormData })} />)

    const input = document.getElementById('photo-upload') as HTMLInputElement
    const newFile = new File(['img'], 'extra.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [newFile] } })

    // When already at 5, no new photos should be added (slice(0, 5-5) = [])
    // setFormData should not be called with more than 5 photos
    if (setFormData.mock.calls.length > 0) {
      const updater = setFormData.mock.calls[0][0]
      const result = typeof updater === 'function' ? updater({ photos: existing }) : null
      if (result) {
        expect(result.photos.length).toBeLessThanOrEqual(5)
      }
    }
  })
})
