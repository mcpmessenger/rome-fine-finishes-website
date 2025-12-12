"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"

interface DocumentUploaderProps {
  onUploadComplete: (document: {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    description: string
    uploadDate: string
    file?: File
  }) => void
}

export default function DocumentUploader({ onUploadComplete }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return "Please upload an image (JPG, PNG, GIF, WebP) or document (PDF, DOC, DOCX, TXT) file."
    }
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB.`
    }
    return null
  }

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("fileName", file.name)

        const response = await fetch("/api/generate-document-description", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to upload document")
        }

        const data = await response.json()

        // Create a unique ID for the document
        const documentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        onUploadComplete({
          id: documentId,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          description: data.description,
          uploadDate: data.uploadDate,
          file: file, // Store the file for potential download/preview
        })
      } catch (err: any) {
        console.error("Upload error:", err)
        setError(err.message || "Failed to upload document. Please try again.")
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [onUploadComplete]
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

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? "border-accent bg-accent/5" : "border-border bg-muted/30"}
          ${isUploading ? "opacity-50 cursor-wait" : "cursor-pointer"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="document-upload"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-muted-foreground">Uploading and generating description...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div>
              <label
                htmlFor="document-upload"
                className="text-accent hover:opacity-90 cursor-pointer font-medium"
              >
                Click to upload
              </label>
              <span className="text-muted-foreground"> or drag and drop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Images (JPG, PNG, GIF, WebP) or Documents (PDF, DOC, DOCX, TXT) up to 10MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}

