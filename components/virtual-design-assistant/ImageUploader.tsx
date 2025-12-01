"use client"

import { useCallback, useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
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
        <input
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
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
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="mb-4 p-4 rounded-full bg-muted">
              {isDragging ? (
                <Upload className="w-8 h-8 text-accent" />
              ) : (
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <p className="text-lg font-medium mb-2">
              {isDragging ? "Drop your image here" : "Upload or drag & drop your image"}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG or PNG up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </label>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}

