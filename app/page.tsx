"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { UploadPage } from "@/components/upload-page"
import { ResultsPage } from "@/components/results-page"
import { BackgroundDoodles } from "@/components/background-doodles"
import { CoffeeStains } from "@/components/coffee-stains"
import type { RankedPhoto } from "@/lib/api"

export type VibeType = "humorous" | "warm" | "polite" | "chill" | "flirty"

export interface UploadedPhoto {
  id: string
  url: string
  name: string
  file: File
}

export interface FormData {
  bio: string
  vibe: VibeType
  photos: UploadedPhoto[]
}

export default function ProfileGlow() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [currentPage, setCurrentPage] = useState<"upload" | "results">("upload")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rewrittenBios, setRewrittenBios] = useState<string[]>([])
  const [rankedPhotos, setRankedPhotos] = useState<RankedPhoto[]>([])
  const [formData, setFormData] = useState<FormData>({
    bio: "",
    vibe: "warm",
    photos: []
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/auth")
      else setAuthChecked(true)
    })
  }, [router])

  if (!authChecked) return null

  const handleSubmit = (bios: string[], ranked: RankedPhoto[]) => {
    setRewrittenBios(bios)
    setRankedPhotos(ranked)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage("results")
      setIsTransitioning(false)
    }, 600)
  }

  const handleBack = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentPage("upload")
      setRewrittenBios([])
      setRankedPhotos([])
      setIsTransitioning(false)
    }, 600)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/auth")
  }

  return (
    <main className="min-h-screen bg-cream paper-texture paper-crease relative overflow-hidden">
      <CoffeeStains />
      <BackgroundDoodles />

      <div className="relative z-10">
        {currentPage === "upload" ? (
          <div className={isTransitioning ? "page-flip-out" : ""}>
            <UploadPage
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <div className={isTransitioning ? "page-flip-out" : "page-flip-in"}>
            <ResultsPage
              formData={formData}
              rewrittenBios={rewrittenBios}
              rankedPhotos={rankedPhotos}
              onBack={handleBack}
              onLogout={handleLogout}
            />
          </div>
        )}
      </div>
    </main>
  )
}
