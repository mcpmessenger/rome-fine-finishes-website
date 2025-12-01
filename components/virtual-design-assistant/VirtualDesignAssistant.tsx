"use client"

import { useState, useRef, useCallback } from "react"
import { Sparkles, AlertCircle } from "lucide-react"
import ImageUploader from "./ImageUploader"
import SurfaceTypeDetector, { SurfaceType } from "./SurfaceTypeDetector"
import TransformationViewer from "./TransformationViewer"
import ServiceCTA from "./ServiceCTA"

export default function VirtualDesignAssistant() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [detectedSurface, setDetectedSurface] = useState<SurfaceType>(null)
  const [transformedImage, setTransformedImage] = useState<string | null>(null)
  const [transformedMimeType, setTransformedMimeType] = useState<string>("image/png")
  const [isTransforming, setIsTransforming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const transformingRef = useRef(false)
  const lastTransformRef = useRef<string>("")

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file)
    setDetectedSurface(null)
    setTransformedImage(null)
    setError(null)
    transformingRef.current = false
    lastTransformRef.current = ""
  }

  const handleTransform = useCallback(async (surfaceType: SurfaceType) => {
    if (!selectedImage || !surfaceType) return

    // Prevent duplicate calls
    if (transformingRef.current) {
      console.log("Transformation already in progress, skipping...")
      return
    }

    const transformKey = `${selectedImage.name}-${surfaceType}`
    if (lastTransformRef.current === transformKey && transformedImage) {
      console.log("Transformation already completed for this image/surface, skipping...")
      return
    }

    transformingRef.current = true
    setIsTransforming(true)
    setError(null)
    setTransformedImage(null)

    try {
      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("surfaceType", surfaceType)

      const response = await fetch("/api/transform-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        const errorMsg = errorData.error || "Failed to transform image"
        const errorDetails = errorData.details ? `: ${errorData.details}` : ""
        throw new Error(`${errorMsg}${errorDetails}`)
      }

      const data = await response.json()
      setTransformedImage(data.transformedImage)
      setTransformedMimeType(data.mimeType || "image/png")
      lastTransformRef.current = transformKey
    } catch (err: any) {
      const errorMessage = err.message || "Failed to transform image"
      setError(errorMessage)
      console.error("Transformation error:", err)
      lastTransformRef.current = "" // Allow retry on error
    } finally {
      setIsTransforming(false)
      transformingRef.current = false
    }
  }, [selectedImage, transformedImage])

  const handleSurfaceDetected = useCallback((surfaceType: SurfaceType) => {
    setDetectedSurface(surfaceType)
    // Auto-trigger transformation when surface is detected (only once)
    if (surfaceType && selectedImage && !transformingRef.current) {
      const transformKey = `${selectedImage.name}-${surfaceType}`
      if (lastTransformRef.current !== transformKey) {
        lastTransformRef.current = transformKey
        handleTransform(surfaceType)
      }
    }
  }, [selectedImage, handleTransform])

  const handleReset = () => {
    setSelectedImage(null)
    setDetectedSurface(null)
    setTransformedImage(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-accent" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold">
            Virtual Design Assistant
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See your space transformed before you commit. Upload a photo and get an instant
          visualization of our professional refinishing services.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column - Upload & Detection */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4">Step 1: Upload Your Photo</h2>
            <ImageUploader
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
            />
          </div>

          {selectedImage && (
            <div>
              <h2 className="text-2xl font-serif font-bold mb-4">Step 2: Surface Detection</h2>
              <SurfaceTypeDetector
                image={selectedImage}
                onSurfaceDetected={handleSurfaceDetected}
                onError={(err) => setError(err)}
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Transformation & CTA */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4">
              {transformedImage ? "Your Transformation" : "Preview"}
            </h2>
            <TransformationViewer
              originalImage={selectedImage}
              transformedImage={transformedImage}
              mimeType={transformedMimeType}
              isProcessing={isTransforming}
              onReset={handleReset}
            />
          </div>

          {detectedSurface && transformedImage && (
            <ServiceCTA surfaceType={detectedSurface} />
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
        <h3 className="text-xl font-serif font-bold mb-3">How It Works</h3>
        <ol className="space-y-2 text-muted-foreground">
          <li className="flex gap-3">
            <span className="font-semibold text-foreground">1.</span>
            <span>Upload a photo of your cabinets, fireplace, deck, or room</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground">2.</span>
            <span>Our AI automatically detects the surface type</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground">3.</span>
            <span>See a professional transformation visualization</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-foreground">4.</span>
            <span>Schedule a consultation to bring your vision to life</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

