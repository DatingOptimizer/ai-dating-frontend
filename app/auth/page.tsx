"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess("Account created! Welcome to ProfileGlow 💕")
        setTimeout(() => { router.push("/"); router.refresh() }, 1500)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/")
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream paper-texture flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-semibold text-pencil">ProfileGlow ✨</h1>
          <p className="font-sans text-muted-text mt-2">Your dating profile, polished by AI</p>
        </div>

        <div className="bg-warm-white border-2 border-dashed border-pencil rounded-xl p-6 shadow-md">
          {/* Tab toggle */}
          <div className="flex mb-6 rounded-full overflow-hidden border-2 border-pencil">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 font-mono text-sm transition-colors ${mode === "login" ? "bg-blush text-white" : "text-pencil hover:bg-pencil/5"}`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 font-mono text-sm transition-colors ${mode === "signup" ? "bg-blush text-white" : "text-pencil hover:bg-pencil/5"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-sm text-pencil block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border-2 border-dashed border-pencil rounded-lg px-3 py-2 font-sans text-pencil bg-cream focus:outline-none focus:border-blush"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="font-mono text-sm text-pencil block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border-2 border-dashed border-pencil rounded-lg px-3 py-2 font-sans text-pencil bg-cream focus:outline-none focus:border-blush"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="font-sans text-sm text-red-500">{error}</p>}
            {success && <p className="font-sans text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blush text-white font-serif text-xl py-3 rounded-full border-2 border-dashed border-pencil hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "..." : mode === "login" ? "Log In 💕" : "Sign Up ✨"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
