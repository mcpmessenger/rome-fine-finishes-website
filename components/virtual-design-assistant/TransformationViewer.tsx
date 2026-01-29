"use client"

import { Loader2, Download, RotateCcw } from "lucide-react"

interface TransformationViewerProps {
  originalImage: File | null
  transformedImage: string | null // base64 image data
  mimeType?: string
  isProcessing: boolean
  onReset?: () => void
}

export default function TransformationViewer({
  originalImage,
  transformedImage,
  mimeType = "image/png",
  isProcessing,
  onReset,
}: TransformationViewerProps) {
  const handleDownload = () => {
    if (!transformedImage) return

    const link = document.createElement("a")
    link.href = `data:${mimeType};base64,${transformedImage}`
    link.download = `transformed-${Date.now()}.${mimeType.split("/")[1]}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!originalImage && !transformedImage) {
    return null
  }

  return (
    <div className="w-full space-y-4">
      {/* Image Display - Only show "After" */}
      <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted">
        {isProcessing ? (
          <div className="flex items-center justify-center min-h-[400px] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="text-muted-foreground">Transforming your image...</span>
          </div>
        ) : transformedImage ? (
          <div className="relative aspect-video">
            <img
              src={`data:${mimeType};base64,${transformedImage}`}
              alt="Transformed"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs font-medium">
              After
            </div>
          </div>
        ) : originalImage ? (
          <div className="relative aspect-video flex flex-col items-center justify-center bg-muted/50 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              {/* Re-using Sparkles from lucide-react (need to ensure import or use existing) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-accent"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
            </div>
            <h3 className="text-lg font-serif font-bold mb-2">Ready to Transform</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Select your surface type (e.g., Cabinets) and click "Transform Image" to see the magic happen here!
            </p>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      {transformedImage && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Download Result
          </button>
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-2 bg-muted hover:bg-muted/80 rounded font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Another
            </button>
          )}
        </div>
      )}
    </div>
  )
}
