"use client"

import { useState, useEffect } from "react"
import type { FormData } from "@/app/page"
import { FallingCelebration } from "@/components/falling-celebration"
import { BackArrowIcon } from "@/components/icons/back-arrow-icon"
import { NotebookIcon } from "@/components/icons/notebook-icon"
import { CameraIcon } from "@/components/icons/camera-icon"
import { SpeechBubbleIcon } from "@/components/icons/speech-bubble-icon"
import { StarIcon } from "@/components/icons/star-icon"
import { PaperClipIcon } from "@/components/icons/paper-clip-icon"
import { WashiTape } from "@/components/icons/washi-tape"
import { PushpinIcon } from "@/components/icons/pushpin-icon"
import { Camera, Sparkles } from "lucide-react"

interface ResultsPageProps {
  formData: FormData
  rewrittenBios: string[]
  onBack: () => void
}

const originalBio = "I like hiking and coffee. Looking for someone fun. I'm easy going and love to laugh."

const optimizedBios = [
  {
    title: "✦ The Charmer",
    text: "Coffee enthusiast who believes the best conversations happen over a perfectly brewed latte. I'm the person who'll make you laugh at a museum and actually enjoy a rainy Sunday. Fair warning: I have strong opinions about pizza toppings and an embarrassingly good playlist.",
    bg: "bg-golden",
    rotate: "-1.2deg"
  },
  {
    title: "✦ The Storyteller", 
    text: "Life's too short for boring stories, so I'm busy collecting good ones. From spontaneous road trips to trying that weird dish on the menu – I'm in. Currently accepting applications for someone to debate whether the movie or book was better. Spoiler alert: it's always the book.",
    bg: "bg-mint",
    rotate: "1.5deg"
  },
  {
    title: "✦ The Bold One",
    text: "Not here to play it safe. I want deep talks at 2am, adventures that make great stories, and someone who isn't afraid to be themselves. Swipe right if you think pineapple on pizza is acceptable (I promise I'm still worth it even if you're wrong).",
    bg: "bg-lavender",
    rotate: "-0.6deg"
  }
]


const conversationStarters = [
  "I see you're into hiking — what trail made you feel most alive?",
  "Hot take: pineapple on pizza is elite. Fight me or join me?",
  "If we matched in a parallel universe, what would our first date look like?",
  "Your dog is adorable — do they accept bribes in treat form?",
  "I have a theory that bookworms are the best conversationalists. Prove me right?"
]

export function ResultsPage({ formData, rewrittenBios, onBack }: ResultsPageProps) {
  const [showCelebration, setShowCelebration] = useState(true)
  const [copiedBio, setCopiedBio] = useState<number | null>(null)
  const [copiedStarter, setCopiedStarter] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowCelebration(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  const copyToClipboard = async (text: string, type: "bio" | "starter", index: number) => {
    await navigator.clipboard.writeText(text)
    if (type === "bio") {
      setCopiedBio(index)
      setTimeout(() => setCopiedBio(null), 2000)
    } else {
      setCopiedStarter(index)
      setTimeout(() => setCopiedStarter(null), 2000)
    }
  }

  const displayOriginalBio = formData.bio || originalBio
  const optimizedBiosToShow =
    rewrittenBios.length > 0
      ? rewrittenBios.map((text, index) => {
          const fallback = optimizedBios[index % optimizedBios.length]
          return { ...fallback, text }
        })
      : optimizedBios

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {showCelebration && <FallingCelebration />}
      
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-pencil font-sans hover:text-blush transition-colors"
          aria-label="Go back to upload page"
        >
          <BackArrowIcon className="w-6 h-6" />
          <span>Start Over</span>
        </button>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-pencil text-center flex-1">
          {"Here's Your Glow-Up 💕"}
        </h1>
        <div className="w-24" aria-hidden="true" />
      </header>

      {/* Before/After Comparison Section */}
      <section className="mb-12 fade-in-up" style={{ animationDelay: "0ms" }}>
        <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-4 relative">
          {/* Before Card */}
          <div 
            className="flex-1 bg-[#F5F0E8] rounded-lg p-5 border-2 border-dashed border-pencil/60 relative opacity-85 fade-in-up"
            style={{ 
              borderDasharray: "8 4 12 4",
              animationDelay: "200ms"
            }}
          >
            {/* Score Badge */}
            <div 
              className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-2 border-dashed border-pencil flex items-center justify-center bg-warm-white"
              style={{ borderDasharray: "6 3" }}
            >
              <span className="font-serif text-lg text-pencil">6/10</span>
            </div>
            
            <h3 className="font-mono text-lg text-pencil mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>Your Original</span>
            </h3>
            <p className="font-sans text-pencil/80 leading-relaxed italic">
              {displayOriginalBio}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center md:-mx-2 z-10">
            <CurvedArrow />
          </div>

          {/* After Card */}
          <div 
            className="flex-1 bg-warm-white rounded-lg p-5 border-2 border-dashed border-pencil relative fade-in-up"
            style={{ 
              transform: "scale(1.02)",
              boxShadow: "0 0 20px rgba(245,213,160,0.3)",
              borderDasharray: "8 4 12 4",
              animationDelay: "400ms"
            }}
          >
            {/* Score Badge */}
            <div 
              className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-2 border-dashed border-blush flex items-center justify-center bg-warm-white"
              style={{ borderDasharray: "6 3" }}
            >
              <span className="font-serif text-lg text-blush">9/10</span>
              <StarIcon className="absolute -top-1 -right-1 w-4 h-4 text-golden" />
            </div>
            
            <h3 className="font-mono text-lg text-pencil mb-3 flex items-center gap-2">
              <span>✨</span>
              <span>After the Glow-Up</span>
            </h3>
            <p className="font-sans text-pencil leading-relaxed">
              {optimizedBiosToShow[0]?.text ?? ""}
            </p>
          </div>
        </div>
      </section>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1 - Optimized Bios */}
        <div className="relative fade-in-up" style={{ animationDelay: "600ms" }}>
          <PaperClipIcon className="absolute -top-3 -left-2 w-10 h-10 text-pencil z-10" />
          <div 
            className="bg-warm-white border-2 border-dashed border-pencil rounded-lg shadow-[4px_4px_0px_#E8DFD3] torn-edge pt-6 pb-4 px-4 min-h-[480px]"
            style={{ borderDasharray: "8 4 12 4" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <NotebookIcon className="w-6 h-6 text-pencil" />
              <h2 className="font-serif text-2xl text-pencil">Optimized Bios</h2>
            </div>
            
            <div className="space-y-4">
              {optimizedBiosToShow.map((bio, index) => (
                <div
                  key={index}
                  className={`${bio.bg} p-4 rounded-sm shadow-md relative`}
                  style={{ transform: `rotate(${bio.rotate})` }}
                >
                  <h3 className="font-mono text-sm text-pencil mb-2">{bio.title}</h3>
                  <p className="font-sans text-sm text-pencil leading-relaxed pr-16">{bio.text}</p>
                  <button
                    onClick={() => copyToClipboard(bio.text, "bio", index)}
                    className={`
                      absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-sans
                      border border-dashed transition-all
                      ${copiedBio === index 
                        ? "bg-mint text-pencil border-mint" 
                        : "bg-white text-pencil border-pencil hover:bg-pencil/5"
                      }
                    `}
                    style={{ borderDasharray: "4 2" }}
                    aria-label={`Copy ${bio.title} bio`}
                  >
                    {copiedBio === index ? "Copied!" : "📋 Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 - Photo Ranking */}
        <div className="relative fade-in-up" style={{ animationDelay: "800ms" }}>
          <WashiTape className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-6 z-10" />
          <div 
            className="bg-warm-white border-2 border-dashed border-pencil rounded-lg shadow-[4px_4px_0px_#E8DFD3] torn-edge pt-8 pb-4 px-4 min-h-[480px]"
            style={{ borderDasharray: "8 4 12 4" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CameraIcon className="w-6 h-6 text-pencil" />
              <h2 className="font-serif text-2xl text-pencil">Photo Ranking</h2>
            </div>
            
            {/* Cascading Polaroids or empty state */}
            {formData.photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-80 gap-3 text-center">
                <Camera className="w-12 h-12 text-pencil/20" strokeWidth={1.5} />
                <p className="font-sans text-sm text-muted-text italic">
                  No photos uploaded
                </p>
                <p className="font-mono text-xs text-muted-text/70">
                  Go back and add photos to get your ranking!
                </p>
              </div>
            ) : (
              <div className="relative h-80 mt-4">
                {formData.photos.slice(0, 3).map((photo, index) => {
                  const rotations = [-3, 1, -2]
                  const offsets = [0, 90, 180]
                  const isFirst = index === 0
                  const size = isFirst ? 150 : 115

                  return (
                    <div
                      key={photo.id}
                      className={`absolute left-1/2 -translate-x-1/2 bg-white p-2 pb-12 shadow-lg ${isFirst ? "z-30" : index === 1 ? "z-20" : "z-10"}`}
                      style={{
                        transform: `translateX(-50%) rotate(${rotations[index]}deg)`,
                        width: `${size}px`,
                        top: `${offsets[index]}px`
                      }}
                    >
                      <span className="absolute top-2 left-2 font-serif text-2xl text-blush font-bold">
                        #{index + 1}
                      </span>
                      {isFirst && (
                        <StarIcon className="absolute top-1 right-1 w-8 h-8 text-golden" />
                      )}
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full aspect-square object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Card 3 - Conversation Starters */}
        <div className="relative fade-in-up" style={{ animationDelay: "1000ms" }}>
          <PushpinIcon className="absolute -top-2 left-4 w-8 h-8 z-10" />
          <div 
            className="bg-warm-white border-2 border-dashed border-pencil rounded-lg shadow-[4px_4px_0px_#E8DFD3] torn-edge pt-6 pb-4 px-4 min-h-[480px]"
            style={{ borderDasharray: "8 4 12 4" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <SpeechBubbleIcon className="w-6 h-6 text-pencil" />
              <h2 className="font-serif text-2xl text-pencil">Conversation Starters</h2>
            </div>
            
            <div className="space-y-3">
              {conversationStarters.map((starter, index) => {
                const isLeft = index % 2 === 0
                const bgColor = isLeft ? "bg-warm-white" : "bg-[#E8F5ED]"
                
                return (
                  <div
                    key={index}
                    className={`
                      relative ${bgColor} p-3 rounded-xl border border-dashed border-pencil/30
                      ${isLeft ? "mr-4 rounded-bl-none" : "ml-4 rounded-br-none"}
                    `}
                    style={{ borderDasharray: "6 3" }}
                  >
                    <p className="font-sans text-sm text-pencil pr-14">{starter}</p>
                    <button
                      onClick={() => copyToClipboard(starter, "starter", index)}
                      className={`
                        absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-sans
                        border border-dashed transition-all
                        ${copiedStarter === index 
                          ? "bg-mint text-pencil border-mint" 
                          : "bg-white text-pencil border-pencil hover:bg-pencil/5"
                        }
                      `}
                      style={{ borderDasharray: "4 2" }}
                      aria-label={`Copy conversation starter ${index + 1}`}
                    >
                      {copiedStarter === index ? "Copied!" : "Copy"}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center">
        <FooterDoodle />
        <p className="font-mono text-sm text-muted-text mt-2">
          Made with 💕 by ProfileGlow
        </p>
      </footer>
    </div>
  )
}

function CurvedArrow() {
  return (
    <div className="relative">
      <svg width="60" height="40" viewBox="0 0 60 40" fill="none" className="md:rotate-0 rotate-90">
        <path 
          d="M5 20 Q 30 5, 45 20" 
          stroke="var(--blush)" 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="8 4"
        />
        <path 
          d="M40 15 L48 20 L40 25" 
          stroke="var(--blush)" 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Sparkles 
        className="absolute -top-1 -right-1 w-4 h-4 text-golden" 
        strokeWidth={1.5} 
      />
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
