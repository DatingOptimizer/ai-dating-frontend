// HANDWRITTEN TESTS

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthPage from '@/app/auth/page'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}))

describe('AuthPage — handwritten scenarios', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockRefresh.mockClear()
    mockSignIn.mockClear()
    mockSignUp.mockClear()
  })

  it('email field is actually focusable and accepts input', async () => {
    render(<AuthPage />)
    const emailInput = screen.getByPlaceholderText('you@example.com')
    await userEvent.type(emailInput, 'hello@world.com')
    expect(emailInput).toHaveValue('hello@world.com')
  })

  it('password field masks input (type=password)', () => {
    render(<AuthPage />)
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'password')
  })

  it('switching to sign-up tab after a login error still shows the sign-up button', async () => {
    mockSignIn.mockResolvedValue({ error: new Error('Wrong password') })
    render(<AuthPage />)

    // trigger an error on the login tab
    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'x@x.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'badpass')
    fireEvent.submit(screen.getByRole('button', { name: /log in 💕/i }))
    await waitFor(() => expect(screen.getByText('Wrong password')).toBeInTheDocument())

    // switch to sign-up — should show sign-up form without crashing
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByRole('button', { name: /sign up ✨/i })).toBeInTheDocument()
  })

  it('submitting the form calls signIn with whatever the user typed', async () => {
    // jsdom doesn't enforce HTML5 required, so signIn gets called with the field values
    mockSignIn.mockResolvedValue({ error: null })
    render(<AuthPage />)

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'me@example.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'mypassword')
    fireEvent.submit(screen.getByRole('button', { name: /log in 💕/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'me@example.com', password: 'mypassword' })
      )
    })
  })

  it('signup form also shows the password field', async () => {
    render(<AuthPage />)
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('redirects to home only once on successful login (no double-push)', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<AuthPage />)

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'pass1234')
    fireEvent.submit(screen.getByRole('button', { name: /log in 💕/i }))

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1))
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
