// HANDWRITTEN TESTS

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryPanel } from '@/components/history-panel'

vi.mock('@/components/icons/notebook-icon', () => ({ NotebookIcon: () => null }))
vi.mock('@/components/icons/speech-bubble-icon', () => ({ SpeechBubbleIcon: () => null }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockGetHistory = vi.fn()
const mockDeleteBio = vi.fn()
const mockDeleteStarter = vi.fn()

vi.mock('@/lib/api', () => ({
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
  deleteBio: (...args: unknown[]) => mockDeleteBio(...args),
  deleteStarter: (...args: unknown[]) => mockDeleteStarter(...args),
}))

describe('HistoryPanel — handwritten', () => {
  beforeEach(() => {
    mockGetHistory.mockClear()
    mockDeleteBio.mockClear()
    mockDeleteStarter.mockClear()
  })

  it('when you have two bios and delete one, the other should still be there', async () => {
    const bio1 = { id: 'bio-1', content: 'First bio here', createdAt: '2026-01-01' }
    const bio2 = { id: 'bio-2', content: 'Second bio here', createdAt: '2026-01-02' }
    mockGetHistory.mockResolvedValue({ savedBios: [bio1, bio2], savedStarters: [] })
    mockDeleteBio.mockResolvedValue(undefined)

    render(<HistoryPanel />)
    await waitFor(() => screen.getByText('First bio here'))

    // delete buttons — get all of them and click the first
    const deleteButtons = screen.getAllByRole('button', { name: /delete saved bio/i })
    await userEvent.click(deleteButtons[0])

    await waitFor(() => {
      // one gone, one should still be visible
      expect(screen.queryByText('First bio here')).not.toBeInTheDocument()
      expect(screen.getByText('Second bio here')).toBeInTheDocument()
    })
  })

  it('starter count in the header reflects what was loaded', async () => {
    const starters = [
      { id: 's1', content: 'opener 1', createdAt: '2026-01-01' },
      { id: 's2', content: 'opener 2', createdAt: '2026-01-01' },
      { id: 's3', content: 'opener 3', createdAt: '2026-01-01' },
    ]
    mockGetHistory.mockResolvedValue({ savedBios: [], savedStarters: starters })
    render(<HistoryPanel />)

    await waitFor(() => {
      // Should show (3) somewhere in the starters section header
      expect(screen.getByText('(3)')).toBeInTheDocument()
    })
  })

  it('shows all loaded bios, not just the first one', async () => {
    mockGetHistory.mockResolvedValue({
      savedBios: [
        { id: 'a', content: 'bio alpha', createdAt: '2026-01-01' },
        { id: 'b', content: 'bio beta', createdAt: '2026-01-02' },
      ],
      savedStarters: [],
    })
    render(<HistoryPanel />)

    await waitFor(() => {
      expect(screen.getByText('bio alpha')).toBeInTheDocument()
      expect(screen.getByText('bio beta')).toBeInTheDocument()
    })
  })

  it('section headers are visible even when lists are empty', async () => {
    mockGetHistory.mockResolvedValue({ savedBios: [], savedStarters: [] })
    render(<HistoryPanel />)

    await waitFor(() => {
      expect(screen.getByText('Saved Bios')).toBeInTheDocument()
      expect(screen.getByText('Saved Starters')).toBeInTheDocument()
    })
  })

  it('does not show a delete button when there are no bios', async () => {
    mockGetHistory.mockResolvedValue({ savedBios: [], savedStarters: [] })
    render(<HistoryPanel />)

    await waitFor(() => screen.getByText(/no saved bios yet/i))
    expect(screen.queryByRole('button', { name: /delete saved bio/i })).not.toBeInTheDocument()
  })
})
