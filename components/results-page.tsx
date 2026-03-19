"use client"

import { useState, useEffect } from "react"
import type { FormData, VibeType } from "@/app/page"
import {
  generateOpeners,
  saveBio,
  saveStarter,
  type GenerateOpenersTone,
  type RankedPhoto,
} from "@/lib/api"
import { FallingCelebration } from "@/components/falling-celebration"
import { BackArrowIcon } from "@/components/icons/back-arrow-icon"
import { NotebookIcon } from "@/components/icons/notebook-icon"
import { CameraIcon } from "@/components/icons/camera-icon"
import { SpeechBubbleIcon } from "@/components/icons/speech-bubble-icon"
import { StarIcon } from "@/components/icons/star-icon"
import { PaperClipIcon } from "@/components/icons/paper-clip-icon"
import { AppSidebar } from "@/components/app-sidebar"
import { HistoryPanel } from "@/components/history-panel"
import { toast } from "sonner"
import { Camera, Sparkles, Loader2, ChevronLeft, ChevronRight, BookMarked } from "lucide-react"

interface ResultsPageProps {
  formData: FormData
  rewrittenBios: string[]
  rankedPhotos: RankedPhoto[]
  onBack: () => void
  onLogout: () => void
}

type Tab = "glowup" | "photos" | "starters" | "history"

const optimizedBiosMeta = [
  { title: "✦ The Charmer", bg: "bg-golden", rotate: "-1.2deg" },
  { title: "✦ The Storyteller", bg: "bg-mint", rotate: "1.5deg" },
  { title: "✦ The Bold One", bg: "bg-lavender", rotate: "-0.6deg" },
]

function vibeToTone(vibe: VibeType): GenerateOpenersTone {
  switch (vibe) {
    case "humorous": return "humorous"
    case "warm": return "warm"
    case "polite": return "polite"
    case "flirty": return "bold"
    case "chill":
    default: return "casual"
  }
}

export function ResultsPage({ formData, rewrittenBios, rankedPhotos, onBack, onLogout }: ResultsPageProps) {
  const [showCelebration, setShowCelebration] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("glowup")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [starters, setStarters] = useState<string[]>([])
  const [startersLoading, setStartersLoading] = useState(true)
  const [savingBio, setSavingBio] = useState<number | null>(null)
  const [savingStarter, setSavingStarter] = useState<number | null>(null)
  const [savedBioIndices, setSavedBioIndices] = useState<Set<number>>(new Set())
  const [savedStarterIndices, setSavedStarterIndices] = useState<Set<number>>(new Set())
  const [justSavedBio, setJustSavedBio] = useState<number | null>(null)
  const [justSavedStarter, setJustSavedStarter] = useState<number | null>(null)
  const [currentBioIndex, setCurrentBioIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!formData.bio) { setStartersLoading(false); return }
    generateOpeners({ bio: formData.bio, tone: vibeToTone(formData.vibe) })
      .then(res => setStarters(res.starters))
      .catch(() => setStarters([]))
      .finally(() => setStartersLoading(false))
  }, [formData.bio, formData.vibe])

  const optimizedBiosToShow = rewrittenBios.map((text, index) => ({
    ...optimizedBiosMeta[index % optimizedBiosMeta.length],
    text,
  }))

  const handleSaveBio = async (index: number) => {
    if (savedBioIndices.has(index)) return
    setSavingBio(index)
    try {
      await saveBio(optimizedBiosToShow[index].text)
      setSavedBioIndices(prev => new Set([...prev, index]))
      setJustSavedBio(index)
      setTimeout(() => setJustSavedBio(null), 1500)
      toast.success("Bio saved! 💕")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save bio"
      toast.error(msg)
    }
    setSavingBio(null)
  }

  const handleSaveStarter = async (index: number) => {
    if (savedStarterIndices.has(index)) return
    setSavingStarter(index)
    try {
      await saveStarter(starters[index])
      setSavedStarterIndices(prev => new Set([...prev, index]))
      setJustSavedStarter(index)
      setTimeout(() => setJustSavedStarter(null), 1500)
      toast.success("Starter saved! 💬")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save starter"
      toast.error(msg)
    }
    setSavingStarter(null)
  }

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "glowup", icon: "✨", label: "Glow-Up" },
    { id: "photos", icon: "📸", label: "Photos" },
    { id: "starters", icon: "💬", label: "Starters" },
    { id: "history", icon: "📝", label: "History" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {showCelebration && <FallingCelebration />}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-dashed border-pencil/20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-pencil font-sans hover:text-blush transition-colors"
        >
          <BackArrowIcon className="w-6 h-6" />
          <span>Start Over</span>
        </button>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-pencil">
          {"Here's Your Glow-Up 💕"}
        </h1>
        <div className="w-24" />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as Tab)}
          onLogout={onLogout}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "glowup" && (
            <GlowUpTab
              formData={formData}
              optimizedBiosToShow={optimizedBiosToShow}
              currentBioIndex={currentBioIndex}
              setCurrentBioIndex={setCurrentBioIndex}
              savedBioIndices={savedBioIndices}
              savingBio={savingBio}
              justSavedBio={justSavedBio}
              onSaveBio={handleSaveBio}
            />
          )}
          {activeTab === "photos" && (
            <PhotosTab formData={formData} rankedPhotos={rankedPhotos} />
          )}
          {activeTab === "starters" && (
            <StartersTab
              starters={starters}
              startersLoading={startersLoading}
              savedStarterIndices={savedStarterIndices}
              savingStarter={savingStarter}
              justSavedStarter={justSavedStarter}
              onSaveStarter={handleSaveStarter}
            />
          )}
          {activeTab === "history" && <HistoryPanel />}
        </main>
      </div>
    </div>
  )
}

/* ── Glow-Up Tab ── */
function GlowUpTab({
  formData,
  optimizedBiosToShow,
  currentBioIndex,
  setCurrentBioIndex,
  savedBioIndices,
  savingBio,
  justSavedBio,
  onSaveBio,
}: {
  formData: FormData
  optimizedBiosToShow: { title: string; bg: string; rotate: string; text: string }[]
  currentBioIndex: number
  setCurrentBioIndex: (i: number) => void
  savedBioIndices: Set<number>
  savingBio: number | null
  justSavedBio: number | null
  onSaveBio: (i: number) => void
}) {
  const currentBio = optimizedBiosToShow[currentBioIndex]

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in-up">
      {/* Before / After diff */}
      {formData.bio && currentBio && (
        <section>
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-4 relative">
            <div className="flex-1 bg-[#F5F0E8] rounded-lg p-5 border-2 border-dashed border-pencil/60">
              <h3 className="font-mono text-lg text-pencil mb-3 flex items-center gap-2">
                <span>📝</span><span>Your Original</span>
              </h3>
              <p className="font-sans text-pencil/80 leading-relaxed italic">
                <WordDiff mode="before" before={formData.bio} after={currentBio.text} />
              </p>
            </div>
            <div className="flex items-center justify-center md:-mx-2 z-10">
              <CurvedArrow />
            </div>
            <div
              className="flex-1 bg-warm-white rounded-lg p-5 border-2 border-dashed border-pencil relative"
              style={{ transform: "scale(1.02)", boxShadow: "0 0 20px rgba(245,213,160,0.3)" }}
            >
              <div className="absolute -top-3 -right-3">
                <StarIcon className="w-6 h-6 text-golden" />
              </div>
              <h3 className="font-mono text-lg text-pencil mb-3 flex items-center gap-2">
                <span>✨</span><span>After the Glow-Up</span>
              </h3>
              <p className="font-sans text-pencil leading-relaxed">
                <WordDiff mode="after" before={formData.bio} after={currentBio.text} />
              </p>
              <p className="font-mono text-xs text-muted-text mt-3">✦ highlighted words are new</p>
            </div>
          </div>
        </section>
      )}

      {/* Optimized bios carousel */}
      {optimizedBiosToShow.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <NotebookIcon className="w-5 h-5 text-pencil" />
            <h2 className="font-serif text-2xl text-pencil">Optimized Bios</h2>
            <span className="font-mono text-sm text-muted-text ml-auto">
              {currentBioIndex + 1} / {optimizedBiosToShow.length}
            </span>
          </div>

          <div className="relative">
            <PaperClipIcon className="absolute -top-3 -left-2 w-10 h-10 text-pencil z-10" />
            <div
              className={`${currentBio.bg} rounded-lg p-6 shadow-md relative min-h-[160px]`}
              style={{ transform: `rotate(${currentBio.rotate})` }}
            >
              <h3 className="font-mono text-sm text-pencil mb-3">{currentBio.title}</h3>
              <p className="font-sans text-pencil leading-relaxed pr-4">{currentBio.text}</p>
            </div>

            {/* Navigation + Save */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentBioIndex(Math.max(0, currentBioIndex - 1))}
                  disabled={currentBioIndex === 0}
                  className="p-2 rounded-full border border-dashed border-pencil/40 text-pencil disabled:opacity-30 hover:bg-pencil/5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentBioIndex(Math.min(optimizedBiosToShow.length - 1, currentBioIndex + 1))}
                  disabled={currentBioIndex === optimizedBiosToShow.length - 1}
                  className="p-2 rounded-full border border-dashed border-pencil/40 text-pencil disabled:opacity-30 hover:bg-pencil/5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onSaveBio(currentBioIndex)}
                disabled={savingBio === currentBioIndex || savedBioIndices.has(currentBioIndex)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans border border-dashed transition-all ${
                  savedBioIndices.has(currentBioIndex)
                    ? "bg-mint text-pencil border-mint"
                    : "bg-white text-pencil border-pencil hover:bg-pencil/5"
                } ${justSavedBio === currentBioIndex ? "animate-bounce" : ""}`}
              >
                {savingBio === currentBioIndex ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedBioIndices.has(currentBioIndex) ? (
                  <><span>✓ Saved!</span>{justSavedBio === currentBioIndex && <span className="absolute -top-1 -right-1 text-sm">✨</span>}</>
                ) : (
                  <>
                    <BookMarked className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-3">
              {optimizedBiosToShow.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentBioIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentBioIndex ? "bg-blush" : "bg-pencil/20"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ── Photos Tab ── */
function PhotosTab({ formData, rankedPhotos }: { formData: FormData; rankedPhotos: RankedPhoto[] }) {
  const photoUrlMap = Object.fromEntries(formData.photos.map(p => [p.name, p.url]))

  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <CameraIcon className="w-5 h-5 text-pencil" />
        <h2 className="font-serif text-2xl text-pencil">Photo Ranking</h2>
      </div>

      {formData.photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3 text-center">
          <Camera className="w-12 h-12 text-pencil/20" strokeWidth={1.5} />
          <p className="font-sans text-sm text-muted-text italic">No photos uploaded</p>
          <p className="font-mono text-xs text-muted-text/70">Go back and add photos to get your ranking!</p>
        </div>
      ) : rankedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3 text-center">
          <Camera className="w-12 h-12 text-pencil/20" strokeWidth={1.5} />
          <p className="font-sans text-sm text-muted-text italic">Upload at least 2 photos to get a ranking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rankedPhotos.map((photo, index) => (
            <div
              key={photo.photoName}
              className="flex gap-4 bg-warm-white rounded-xl border-2 border-dashed border-pencil/40 p-4"
              style={{ transform: index % 2 === 0 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
            >
              {/* Rank badge */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span className="font-serif text-3xl font-bold text-blush leading-none">
                  #{photo.rank}
                </span>
                {index === 0 && <StarIcon className="w-5 h-5 text-golden" />}
              </div>

              {/* Photo thumbnail */}
              {photoUrlMap[photo.photoName] && (
                <img
                  src={photoUrlMap[photo.photoName]}
                  alt={photo.photoName}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-md"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-text truncate">{photo.photoName}</span>
                  <span className="ml-auto font-mono text-sm font-bold text-pencil flex-shrink-0">
                    {photo.score.toFixed(0)}/100
                  </span>
                </div>
                {/* Score bar */}
                <div className="w-full bg-pencil/10 rounded-full h-1.5 mb-2">
                  <div
                    className="bg-blush h-1.5 rounded-full transition-all"
                    style={{ width: `${photo.score}%` }}
                  />
                </div>
                <p className="font-sans text-sm text-pencil/80 leading-relaxed">{photo.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Starters Tab ── */
function StartersTab({
  starters,
  startersLoading,
  savedStarterIndices,
  savingStarter,
  justSavedStarter,
  onSaveStarter,
}: {
  starters: string[]
  startersLoading: boolean
  savedStarterIndices: Set<number>
  savingStarter: number | null
  justSavedStarter: number | null
  onSaveStarter: (i: number) => void
}) {
  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <SpeechBubbleIcon className="w-5 h-5 text-pencil" />
        <h2 className="font-serif text-2xl text-pencil">Conversation Starters</h2>
      </div>

      {startersLoading ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3 text-center">
          <Loader2 className="w-8 h-8 text-blush animate-spin" />
          <p className="font-sans text-sm text-muted-text italic">Crafting your openers...</p>
        </div>
      ) : starters.length === 0 ? (
        <p className="font-sans text-sm text-muted-text italic text-center mt-20">
          Couldn't generate starters — try again.
        </p>
      ) : (
        <div className="space-y-3">
          {starters.map((starter, index) => {
            const isLeft = index % 2 === 0
            return (
              <div
                key={index}
                className={`relative bg-warm-white p-3 rounded-xl border border-dashed border-pencil/30 ${
                  isLeft ? "mr-8 rounded-bl-none" : "ml-8 rounded-br-none bg-[#E8F5ED]"
                }`}
              >
                <p className="font-sans text-sm text-pencil pr-20">{starter}</p>
                <button
                  onClick={() => onSaveStarter(index)}
                  disabled={savingStarter === index || savedStarterIndices.has(index)}
                  className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sans border border-dashed transition-all ${
                    savedStarterIndices.has(index)
                      ? "bg-mint text-pencil border-mint"
                      : "bg-white text-pencil border-pencil hover:bg-pencil/5"
                  } ${justSavedStarter === index ? "animate-bounce" : ""}`}
                >
                  {savingStarter === index ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : savedStarterIndices.has(index) ? (
                    <><span>✓ Saved</span>{justSavedStarter === index && <span className="text-sm">✨</span>}</>
                  ) : (
                    <>
                      <BookMarked className="w-3 h-3" /> Save
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Helpers ── */
function WordDiff({ mode, before, after }: { mode: "before" | "after"; before: string; after: string }) {
  const beforeWords = new Set(before.toLowerCase().split(/\W+/).filter(Boolean))
  const afterWords = new Set(after.toLowerCase().split(/\W+/).filter(Boolean))
  const tokens = (mode === "before" ? before : after).split(/(\s+)/)

  return (
    <>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
        const clean = token.toLowerCase().replace(/\W/g, "")
        const isChanged = mode === "before" ? !afterWords.has(clean) : !beforeWords.has(clean)
        if (!isChanged) return <span key={i}>{token}</span>
        if (mode === "before") return <span key={i} className="line-through text-pencil/35">{token}</span>
        return <span key={i} className="bg-golden/40 rounded px-0.5">{token}</span>
      })}
    </>
  )
}

function CurvedArrow() {
  return (
    <div className="relative">
      <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="md:rotate-0 rotate-90">
        <path d="M5 20 Q 30 5, 45 20" stroke="var(--blush)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="8 4" />
        <path d="M40 15 L48 20 L40 25" stroke="var(--blush)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-golden" strokeWidth={1.5} />
    </div>
  )
}
