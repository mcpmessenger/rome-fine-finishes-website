"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleComplete = useCallback(() => {
    setIsVisible(false)
    // Small delay for fade out animation
    setTimeout(() => {
      onComplete()
    }, 500)
    // Stop the video when hiding
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [onComplete])

  useEffect(() => {
    // Show loading screen on:
    // 1. Initial page load
    // 2. Page refresh (F5, Ctrl+R, browser refresh)
    // We'll show it every time the page loads (fresh load or refresh)
    
    setIsVisible(true)
    
    // Try to play the video once it's ready
    const video = videoRef.current
    if (video) {
      const tryPlay = () => {
        const playPromise = video.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("Video autoplay prevented:", error)
            // If autoplay is prevented, just wait a bit then proceed
            setTimeout(() => {
              handleComplete()
            }, 2000)
          })
        }
      }

      if (video.readyState >= 2) {
        // Video is already loaded
        tryPlay()
      } else {
        // Wait for video to be ready
        video.addEventListener('canplay', tryPlay, { once: true })
        video.addEventListener('loadeddata', tryPlay, { once: true })
        // Fallback: start playing after load starts
        video.addEventListener('loadstart', () => {
          setTimeout(tryPlay, 100)
        }, { once: true })
      }
    }
  }, [handleComplete])

  const handleVideoEnd = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-background transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src="/loading-video.mp4"
          className="w-full h-full object-cover"
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={() => {
            console.log("Video error, skipping loading screen")
            handleComplete()
          }}
        />
      </div>
    </div>
  )
}

