"use client"

import { useState } from "react"
import { UploadPage } from "@/components/upload-page"
import { ResultsPage } from "@/components/results-page"
import { BackgroundDoodles } from "@/components/background-doodles"
import { CoffeeStains } from "@/components/coffee-stains"

export type VibeType = "humorous" | "warm" | "polite" | "chill" | "flirty"

export interface UploadedPhoto {
  id: string
  url: string
  name: string
}

export interface FormData {
  bio: string
  vibe: VibeType
  photos: UploadedPhoto[]
}

export default function ProfileGlow() {
  const [currentPage, setCurrentPage] = useState<"upload" | "results">("upload")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rewrittenBios, setRewrittenBios] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    bio: "",
    vibe: "warm",
    photos: []
  })

  const handleSubmit = (bios: string[]) => {
    setRewrittenBios(bios)
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
      setIsTransitioning(false)
    }, 600)
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
            />
          </div>
        ) : (
          <div className={isTransitioning ? "page-flip-out" : "page-flip-in"}>
            <ResultsPage 
              formData={formData}
              rewrittenBios={rewrittenBios}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </main>
  )
}
