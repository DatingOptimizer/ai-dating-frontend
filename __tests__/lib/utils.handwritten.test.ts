// HANDWRITTEN TESTS

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn — handwritten edge cases', () => {
  it('handles array syntax alongside plain strings', () => {
    // clsx supports arrays, make sure our cn wrapper passes them through
    expect(cn(['px-4', 'py-2'], 'font-bold')).toBe('px-4 py-2 font-bold')
  })

  it('empty string arg should not produce extra spaces', () => {
    const result = cn('foo', '', 'bar')
    expect(result).toBe('foo bar')
    expect(result).not.toContain('  ') // no double spaces
  })

  it('Tailwind padding conflict — last one wins', () => {
    // This comes up a lot when overriding component defaults
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('handles deeply nested conditional objects', () => {
    const isActive = true
    const isDisabled = false
    expect(cn({ 'bg-blue-500': isActive, 'opacity-50': isDisabled, 'cursor-not-allowed': isDisabled })).toBe('bg-blue-500')
  })

  it('works fine with zero arguments', () => {
    // shouldn't throw, just return empty string
    expect(cn()).toBe('')
  })
})
