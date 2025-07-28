"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import CloudinaryImage from "../../../components/CloudinaryImage"
import { isValidImageType, isValidFileSize } from "@/lib/cloudinary-utils"

interface PortfolioManagerProps {
  artistId: string
  portfolioImages: string[]
  maxImages?: number
}

export function PortfolioManager({ artistId, portfolioImages: initialImages, maxImages = 100 }: PortfolioManagerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [portfolioImages, setPortfolioImages] = useState(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeletingIndex, setIsDeletingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUploadArea, setShowUploadArea] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (!isValidImageType(file.name)) {
          throw new Error(`Invalid file type: ${file.name}`)
        }
        if (!isValidFileSize(file.size, 20)) {
          throw new Error(`File too large: ${file.name}. Maximum size: 20MB`)
        }

        // Upload to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', `goldiegrace/portfolio/artists/${artistId}`)

        const uploadResponse = await fetch('/api/artist/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        const { publicId } = await uploadResponse.json()

        // Add to portfolio
        const response = await fetch("/api/artist/portfolio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to add image to portfolio")
        }

        const data = await response.json()
        setPortfolioImages(data.portfolioImages)
      }

      setShowUploadArea(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to remove this image from your portfolio?")) {
      return
    }

    setIsDeletingIndex(index)
    setError(null)

    try {
      const response = await fetch(`/api/artist/portfolio/${index}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to remove image")
      }

      const data = await response.json()
      setPortfolioImages(data.portfolioImages)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsDeletingIndex(null)
    }
  }

  const remainingSlots = maxImages - portfolioImages.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Portfolio Images ({portfolioImages.length}/{maxImages})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Showcase your best work. Images should be high quality and represent your style.
          </p>
        </div>
        {remainingSlots > 0 && !showUploadArea && (
          <button
            onClick={() => setShowUploadArea(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Images
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Upload Area */}
      {showUploadArea && remainingSlots > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div 
            className="text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">Uploading...</div>
                <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP up to 20MB
                </p>
              </>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              You can add up to {remainingSlots} more {remainingSlots === 1 ? 'image' : 'images'}.
            </p>
            <button
              onClick={() => setShowUploadArea(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolioImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioImages.map((publicId, index) => (
            <div key={`${publicId}-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <CloudinaryImage
                  publicId={publicId}
                  alt={`Portfolio image ${index + 1}`}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  transformation={{ crop: 'fill' }}
                />
              </div>
              <button
                onClick={() => handleDelete(index)}
                disabled={isDeletingIndex === index}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700 disabled:opacity-50"
                aria-label="Remove image"
              >
                {isDeletingIndex === index ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio images</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading your best work.</p>
          {!showUploadArea && (
            <button
              onClick={() => setShowUploadArea(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Image
            </button>
          )}
        </div>
      )}
    </div>
  )
}