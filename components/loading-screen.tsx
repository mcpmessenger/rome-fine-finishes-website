"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
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
    // Detect mobile device
    const checkMobile = () => {
      // Check window width (mobile is typically < 768px)
      const widthCheck = window.innerWidth < 768
      // Check user agent for mobile devices
      const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      setIsMobile(widthCheck || userAgentCheck)
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    const handleResize = () => {
      checkMobile()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    // Show loading screen on:
    // 1. Initial page load
    // 2. Page refresh (F5, Ctrl+R, browser refresh)
    // We'll show it every time the page loads (fresh load or refresh)
    
    setIsVisible(true)
    
    // Update video source based on device type
    const video = videoRef.current
    if (video) {
      const newSrc = isMobile ? "/download.mp4" : "/loading-video.mp4"
      // Check if we need to update the source
      const currentSrc = video.getAttribute("src")
      if (currentSrc !== newSrc) {
        video.src = newSrc
        video.load() // Reload the video with the new source
      }
      
      // Try to play the video once it's ready
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
  }, [handleComplete, isMobile])

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
          src={isMobile ? "/download.mp4" : "/loading-video.mp4"}
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
