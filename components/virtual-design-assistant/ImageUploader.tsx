"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  maxSize?: number // in bytes
  acceptedTypes?: string[]
}

export default function ImageUploader({
  onImageSelect,
  selectedImage,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png"],
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return "Please upload a JPG or PNG image file."
    }
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB.`
    }
    return null
  }

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      onImageSelect(file)
    },
    [onImageSelect, maxSize, acceptedTypes]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onImageSelect(null as any)
      setError(null)
    },
    [onImageSelect]
  )

  const handleCameraClick = useCallback(() => {
    // Trigger camera input
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }, [])

  const handleCameraInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
      // Reset the input so the same file can be selected again
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ""
      }
    },
    [handleFile]
  )

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging
            ? "border-accent bg-accent/10"
            : "border-border hover:border-accent/50",
          error && "border-destructive",
          selectedImage && "border-accent bg-accent/5"
        )}
      >
        {/* Regular file input for gallery/library */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
        
        {/* Camera input for mobile devices */}
        <input
          ref={cameraInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          capture="environment"
          onChange={handleCameraInput}
          className="hidden"
          id="camera-capture"
        />

        {selectedImage ? (
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected image"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-2 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">{selectedImage.name}</p>
              <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto mb-4">
              {/* Camera button - prominent on mobile */}
              <button
                onClick={handleCameraClick}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                type="button"
              >
                <Camera className="w-5 h-5" />
                <span>Take Photo</span>
              </button>
              
              {/* Upload from gallery button */}
              <label
                htmlFor="image-upload"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-border rounded-lg font-medium hover:bg-muted transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>Choose File</span>
              </label>
            </div>
            
            {/* Drag and drop area */}
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center cursor-pointer w-full"
            >
              <div className="mb-4 p-4 rounded-full bg-muted">
                {isDragging ? (
                  <Upload className="w-8 h-8 text-accent" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">
                {isDragging ? "Drop your image here" : "Or drag & drop your image"}
              </p>
              <p className="text-sm text-muted-foreground">
                JPG or PNG up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </label>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}

