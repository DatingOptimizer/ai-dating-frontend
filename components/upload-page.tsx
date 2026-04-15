"use client"

import { useState } from "react"
import type { FormData, VibeType, UploadedPhoto } from "@/app/page"
import { AppSidebar } from "@/components/app-sidebar"
import { HistoryPanel } from "@/components/history-panel"
import { SquigglyUnderline } from "@/components/icons/squiggly-underline"
import { CameraIcon } from "@/components/icons/camera-icon"
import { QuillIcon } from "@/components/icons/quill-icon"
import { toast } from "sonner"
import { rewriteBio, rankPhotos, type RewriteBioTone, type RankedPhoto } from "@/lib/api"
import {
  PenLine,
  Sparkles,
  Heart,
  Zap,
  Bot,
  Mail,
  Check,
  Smile,
  Coffee,
  Flame,
  Star
} from "lucide-react"

interface UploadPageProps {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onSubmit: (rewrittenBios: string[], rankedPhotos: RankedPhoto[]) => void
  onLogout: () => void
}

const vibeOptions: { value: VibeType; label: string; icon: typeof Smile; bg: string; emoji: string }[] = [
  { value: "humorous", label: "Humorous", icon: Smile, bg: "#FFF3CD", emoji: "😄" },
  { value: "warm", label: "Warm", icon: Heart, bg: "#FFE0E0", emoji: "🥰" },
  { value: "polite", label: "Polite", icon: Star, bg: "#D4EDDA", emoji: "🌸" },
  { value: "chill", label: "Chill", icon: Coffee, bg: "#F0E6D4", emoji: "😌" },
  { value: "flirty", label: "Flirty", icon: Flame, bg: "#FDDDE6", emoji: "😘" },
]

export function UploadPage({ formData, setFormData, onSubmit, onLogout }: UploadPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRankingPhotos, setIsRankingPhotos] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<"optimize" | "saves">("optimize")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: "optimize", icon: "✨", label: "Optimize" },
    { id: "saves", icon: "📝", label: "My Saves" },
  ]
  const charCount = formData.bio.length
  const maxChars = 500

  const vibeToTone = (vibe: VibeType): RewriteBioTone => {
    switch (vibe) {
      case "humorous": return "humorous"
      case "warm": return "warm"
      case "polite": return "polite"
      case "flirty": return "bold"
      case "chill":
      default: return "casual"
    }
  }

  const handleSubmit = async () => {
    const files = formData.photos.map(p => p.file)
    setIsLoading(true)
    setIsRankingPhotos(files.length >= 2)
    try {
      const [bioRes, rankRes] = await Promise.all([
        rewriteBio({ bio: formData.bio, tone: vibeToTone(formData.vibe) }),
        files.length >= 2
          ? rankPhotos(files)
          : Promise.resolve({ rankedPhotos: [] }),
      ])
      onSubmit(bioRes.rewrittenBios, rankRes.rankedPhotos)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
      setIsLoading(false)
      setIsRankingPhotos(false)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    const newPhotos: UploadedPhoto[] = []
    const currentCount = formData.photos.length
    
    Array.from(files).slice(0, 5 - currentCount).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        newPhotos.push({
          id: `photo-${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          name: file.name,
          file,
        })
      }
    })
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos].slice(0, 5)
    }))
  }

  const removePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id)
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center px-4 py-5 border-b border-dashed border-pencil/20">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-pencil">ProfileGlow</h1>
          <span className="text-3xl">✨</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as "optimize" | "saves")}
          onLogout={onLogout}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === "saves" ? (
            <div className="px-6 py-6">
              <HistoryPanel />
            </div>
          ) : (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-8">
      {/* Subheader */}
      <div className="text-center mb-10">
        <p className="font-sans text-lg text-muted-text">
          Your dating profile, polished by AI, in seconds.
        </p>
        <div className="mt-6 flex justify-center">
          <PenLineWithSparkle />
        </div>
      </div>

      {/* Bio Textarea Section */}
      <section className="mb-10">
        <div 
          className="bg-warm-white rounded-xl p-1 border-2 border-dashed border-pencil shadow-md"
          style={{ transform: "rotate(-0.4deg)" }}
        >
          <div className="relative notebook-lines border-l-2 border-margin-red pl-11 pr-4 py-4 min-h-[200px]">
            <label htmlFor="bio" className="sr-only">Your bio</label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value.slice(0, maxChars) }))}
              placeholder="Dear future match, here's a little about me..."
              className="w-full h-full min-h-[180px] bg-transparent resize-none font-sans text-pencil placeholder:text-pencil/40 placeholder:italic focus:outline-none leading-7"
              style={{ lineHeight: "28px" }}
              maxLength={maxChars}
              aria-describedby="char-count"
            />
          </div>
          <div 
            id="char-count"
            className={`text-right pr-4 pb-2 font-mono text-sm transition-colors ${
              charCount > 450 ? "text-blush" : "text-pencil"
            }`}
          >
            {charCount} / {maxChars}
            {charCount >= maxChars && (
              <span className="ml-2" aria-label="Character limit reached">✋</span>
            )}
          </div>
        </div>
      </section>

      {/* Vibe Selector Section */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-serif text-2xl text-pencil">Pick your vibe</h2>
        </div>
        <SquigglyUnderline className="w-32 h-2 text-pencil -mt-2 mb-4" />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {vibeOptions.map((vibe) => {
            const Icon = vibe.icon
            const isSelected = formData.vibe === vibe.value
            return (
              <button
                key={vibe.value}
                onClick={() => setFormData(prev => ({ ...prev, vibe: vibe.value }))}
                className={`
                  relative flex items-center gap-2 px-4 py-3 rounded-full
                  border-2 border-dashed border-pencil
                  transition-all duration-200
                  hover:scale-105 hover:wobble
                  ${isSelected ? "border-solid shadow-inner" : ""}
                `}
                style={{ 
                  backgroundColor: vibe.bg,
                  borderStyle: isSelected ? "solid" : "dashed",
                }}
                aria-pressed={isSelected}
                aria-label={`Select ${vibe.label} vibe`}
              >
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-pencil rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-warm-white" strokeWidth={3} />
                  </div>
                )}
                <Icon className="w-5 h-5 text-pencil" strokeWidth={1.5} />
                <span className="font-mono text-sm text-pencil">{vibe.label}</span>
                <span className="ml-auto text-base" aria-hidden="true">{vibe.emoji}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Connection doodle */}
      <div className="flex justify-center my-8">
        <ConnectedHearts />
      </div>

      {/* Photo Upload Section */}
      <section className="mb-10">
        <div className="flex items-baseline gap-2 mb-1">
          <h2 className="font-serif text-2xl text-pencil">Drop your best shots</h2>
          <span className="font-mono text-sm text-muted-text">(optional)</span>
        </div>
        <p className="font-sans text-sm text-muted-text mb-4">1–5 photos · JPEG or PNG</p>
        
        <div
          className={`
            cork-texture rounded-2xl border-2 border-dashed border-pencil p-8 text-center
            transition-all cursor-pointer
            ${isDragging ? "border-blush bg-warm-white" : ""}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFileUpload(e.dataTransfer.files)
          }}
          onClick={() => document.getElementById("photo-upload")?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload photos by dragging or clicking"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              document.getElementById("photo-upload")?.click()
            }
          }}
        >
          <input
            type="file"
            id="photo-upload"
            className="hidden"
            accept="image/jpeg,image/png"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            aria-label="Select photos to upload"
          />
          
          {formData.photos.length === 0 ? (
            <div className={`flex flex-col items-center gap-3 ${isDragging ? "jiggle" : ""}`}>
              <CameraIcon className="w-12 h-12 text-pencil" />
              <p className="font-sans text-pencil">
                Drag photos here or tap to browse
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {formData.photos.map((photo, index) => {
                const rotation = (Math.random() - 0.5) * 8
                return (
                  <div
                    key={photo.id}
                    className="relative bg-white p-2 pb-8 shadow-lg"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <img
                      src={photo.url}
                      alt={`Uploaded photo ${index + 1}`}
                      className="w-24 h-24 object-cover"
                    />
                    <span className="absolute bottom-2 left-0 right-0 text-center font-mono text-xs text-pencil">
                      Photo {index + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removePhoto(photo.id)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-blush rounded-full flex items-center justify-center text-white text-sm font-bold hover:scale-110 transition-transform"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
              {formData.photos.length < 5 && (
                <div 
                  className="w-28 h-32 border-2 border-dashed border-pencil/40 rounded flex items-center justify-center text-pencil/40"
                >
                  <span className="text-3xl">+</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading || formData.bio.length === 0}
          className={`
            inline-flex items-center gap-3 px-8 py-4 rounded-full
            bg-blush text-white font-serif text-2xl
            border-2 border-dashed border-pencil
            transition-all hover:-translate-y-0.5 hover:shadow-lg hover:wobble
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
          `}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span>Writing your love story...</span>
              <QuillIcon className="w-6 h-6" />
            </>
          ) : (
            <>
              <span>Optimize My Profile</span>
              <span aria-hidden="true">💌</span>
            </>
          )}
        </button>
        
        {isLoading && (
          <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <LoadingBot />
            {isRankingPhotos && (
              <p className="font-mono text-sm text-muted-text">
                Analyzing your photos with AI, this can take up to 60 seconds ✨
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <FooterDoodle />
        <p className="font-mono text-sm text-muted-text mt-2">
          Made with 💕 by ProfileGlow
        </p>
      </footer>
    </div>
          )}
        </main>
      </div>
    </div>
  )
}

function PenLineWithSparkle() {
  return (
    <div className="relative wobble">
      <div 
        className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center"
        style={{ borderColor: "var(--blush)" }}
      >
        <PenLine className="w-8 h-8 text-pencil" strokeWidth={1.5} />
      </div>
      <Sparkles 
        className="absolute -top-1 -right-1 w-5 h-5 text-golden" 
        strokeWidth={1.5} 
      />
    </div>
  )
}

function ConnectedHearts() {
  return (
    <div className="relative w-48 h-12 float">
      {/* Left heart */}
      <Heart 
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 text-blush" 
        strokeWidth={1.5}
        fill="var(--blush)"
      />
      {/* Dashed line */}
      <svg 
        className="absolute left-10 top-1/2 -translate-y-1/2" 
        width="112" 
        height="4" 
        viewBox="0 0 112 4"
      >
        <path 
          d="M0 2 Q 28 -2, 56 2 Q 84 6, 112 2" 
          stroke="var(--blush)" 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="8 4"
        />
      </svg>
      {/* Zap at midpoint */}
      <Zap 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-golden" 
        strokeWidth={1.5}
        fill="var(--golden)"
      />
      {/* Right heart */}
      <Heart 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 text-blush" 
        strokeWidth={1.5}
        fill="var(--blush)"
      />
    </div>
  )
}

function LoadingBot() {
  return (
    <div className="relative w-24 h-24">
      {/* Bot icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Bot className="w-12 h-12 text-pencil" strokeWidth={1.5} />
          <Heart 
            className="absolute -top-1 -right-2 w-4 h-4 text-blush" 
            strokeWidth={1.5}
            fill="var(--blush)"
          />
        </div>
      </div>
      {/* Orbiting mail icons */}
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
        <Mail className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-pencil" strokeWidth={1.5} />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDelay: "-1.33s" }}>
        <Mail className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-pencil" strokeWidth={1.5} />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDelay: "-2.66s" }}>
        <Mail className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-pencil" strokeWidth={1.5} />
      </div>
    </div>
  )
}

function FooterDoodle() {
  return (
    <div className="inline-flex items-center justify-center">
      <svg width="48" height="36" viewBox="0 0 48 36" fill="none" className="text-pencil">
        {/* Envelope body */}
        <rect 
          x="4" y="8" width="40" height="24" rx="2" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeDasharray="8 4 12 4"
          fill="var(--warm-white)"
        />
        {/* Envelope flap */}
        <path 
          d="M4 10 L24 22 L44 10" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        {/* Heart on envelope */}
        <path 
          d="M24 17 C22 15 19 15 19 18 C19 20 24 24 24 24 C24 24 29 20 29 18 C29 15 26 15 24 17Z" 
          fill="var(--blush)"
        />
      </svg>
    </div>
  )
}
