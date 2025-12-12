"use client"

import { useState } from "react"
import { Trash2, RefreshCw } from "lucide-react"
import DocumentUploader from "./DocumentUploader"
import DocumentCard from "./DocumentCard"

interface Document {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadDate: string
  file?: File
}

export default function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([])

  const handleUploadComplete = (document: Document) => {
    setDocuments((prev) => [document, ...prev])
  }

  const handleRemove = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all documents?")) {
      setDocuments([])
    }
  }

  const handleRefresh = () => {
    // In a real app, this would refresh from a server/database
    // For now, it's just a placeholder
    window.location.reload()
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold">Documents & Knowledge ({documents.length})</h2>
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <>
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete all documents"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete All</span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <DocumentUploader onUploadComplete={handleUploadComplete} />

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No documents uploaded yet. Upload a file to get started.</p>
        </div>
      )}
    </div>
  )
}

