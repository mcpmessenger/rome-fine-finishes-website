"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, CheckCircle2, AlertCircle, Hand } from "lucide-react"
import { cn } from "@/lib/utils"

export type SurfaceType = "cabinets" | "fireplace" | "deck" | "room" | null

interface SurfaceTypeDetectorProps {
  image: File | null
  onSurfaceDetected: (surfaceType: SurfaceType) => void
  onError?: (error: string) => void
}

const SURFACE_LABELS: Record<string, string> = {
  cabinets: "Cabinet Refinishing",
  fireplace: "Fireplace Remodeling",
  deck: "Deck Restoration",
  room: "Full Room Refinishing",
}

export default function SurfaceTypeDetector({
  image,
  onSurfaceDetected,
  onError,
}: SurfaceTypeDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedSurface, setDetectedSurface] = useState<SurfaceType>(null)
  const [error, setError] = useState<string | null>(null)
  const [showManualSelect, setShowManualSelect] = useState(false)
  const hasDetectedRef = useRef(false)
  const currentImageRef = useRef<File | null>(null)

  useEffect(() => {
    // Reset if image changes
    if (image !== currentImageRef.current) {
      hasDetectedRef.current = false
      currentImageRef.current = image
      setDetectedSurface(null)
      setError(null)
      setShowManualSelect(false)
    }

    if (!image || hasDetectedRef.current) {
      return
    }

    // Prevent multiple simultaneous calls
    if (isDetecting) {
      return
    }

    const detectSurface = async () => {
      setIsDetecting(true)
      setError(null)
      hasDetectedRef.current = true

      try {
        const formData = new FormData()
        formData.append("image", image)

        const response = await fetch("/api/detect-surface-type", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          const errorMsg = errorData.error || "Failed to detect surface type"
          const errorDetails = errorData.details ? `: ${errorData.details}` : ""
          throw new Error(`${errorMsg}${errorDetails}`)
        }

        const data = await response.json()
        const surfaceType = data.surfaceType as SurfaceType
        setDetectedSurface(surfaceType)
        onSurfaceDetected(surfaceType)
      } catch (err: any) {
        const errorMessage = err.message || "Failed to detect surface type"
        setError(errorMessage)
        onError?.(errorMessage)
        setDetectedSurface(null)
        setShowManualSelect(true) // Show manual selection on error
        hasDetectedRef.current = false // Allow retry on error
      } finally {
        setIsDetecting(false)
      }
    }

    detectSurface()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]) // Only depend on image, not callbacks

  if (!image) {
    return null
  }

  const handleManualSelect = (surfaceType: SurfaceType) => {
    setDetectedSurface(surfaceType)
    setShowManualSelect(false)
    setError(null)
    onSurfaceDetected(surfaceType)
  }

  return (
    <div className="w-full space-y-4">
      {isDetecting ? (
        <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Detecting surface type...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{error}</p>
              {error.includes("rate limit") && (
                <p className="text-xs text-muted-foreground mt-1">
                  The free tier has rate limits. You can continue using manual selection below.
                </p>
              )}
            </div>
          </div>
          {showManualSelect && (
            <div className="mt-3 pt-3 border-t border-destructive/20">
              <p className="text-xs font-medium text-foreground mb-2">Continue by selecting manually:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SURFACE_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleManualSelect(key as SurfaceType)}
                    className="px-3 py-2 text-xs font-medium bg-background border border-border rounded hover:bg-muted hover:border-accent transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : detectedSurface ? (
        <div className="flex items-center justify-center gap-2 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">
            Detected: {SURFACE_LABELS[detectedSurface]}
          </span>
        </div>
      ) : null}
    </div>
  )
}

