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
          <div className="relative aspect-video">
            <img
              src={URL.createObjectURL(originalImage)}
              alt="Original"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs font-medium">
              Upload your image to see the transformation
            </div>
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
