"use client"

import { useState } from "react"
import { FileImage, FileText, X, CheckCircle2, Download } from "lucide-react"

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadDate: string
  file?: File
}

interface DocumentCardProps {
  document: Document
  onRemove: (id: string) => void
}

export default function DocumentCard({ document, onRemove }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isImage = document.fileType.startsWith("image/")
  const Icon = isImage ? FileImage : FileText

  const handleDownload = () => {
    if (document.file) {
      const url = URL.createObjectURL(document.file)
      const link = document.createElement("a")
      link.href = url
      link.download = document.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-1">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{document.fileName}</h3>
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>completed • uploaded</span>
              <span>•</span>
              <span>{formatFileSize(document.fileSize)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {document.file && (
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(document.id)}
            className="p-2 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="relative mt-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {document.description}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Collapse description"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 text-sm text-accent hover:opacity-90 transition-opacity"
        >
          Show description
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Uploaded: {formatDate(document.uploadDate)}
        </p>
      </div>
    </div>
  )
}

