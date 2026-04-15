// HANDWRITTEN TESTS

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile — handwritten boundary checks', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  function setWidth(w: number) {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: w })
  }

  it('exactly 768px should NOT be mobile (breakpoint is strictly less than)', () => {
    setWidth(768)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('767px — one pixel below breakpoint — should be mobile', () => {
    setWidth(767)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('a very large screen (4K, 3840px) should definitely not be mobile', () => {
    setWidth(3840)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('tiny screen like an old flip phone (240px) should be mobile', () => {
    setWidth(240)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })
})
