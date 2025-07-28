"use client"

import { useState } from "react"
import CloudinaryImage from "../../../components/CloudinaryImage"
import RatingStars from "../RatingStars"
import { ProfileImageUpload } from "./ProfileImageUpload"

interface ProfileHeaderProps {
  artist: {
    id: string
    name: string
    firstName: string | null
    lastName: string | null
    profileImage: string | null
    location: string | null
    badges: string[]
    bio: string | null
    isAvailable: boolean
  }
  averageRating: number
  totalReviews: number
}

export function ProfileHeader({ artist, averageRating, totalReviews }: ProfileHeaderProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  
  const truncatedBio = artist.bio && artist.bio.length > 150 
    ? artist.bio.substring(0, 150) + '...' 
    : artist.bio

  // Display name with firstName and lastName, fallback to name field
  const displayName = artist.firstName || artist.lastName 
    ? `${artist.firstName || ''} ${artist.lastName || ''}`.trim()
    : artist.name

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center md:items-start md:flex-shrink-0">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100">
              {artist.profileImage ? (
                <CloudinaryImage
                  publicId={artist.profileImage}
                  alt={displayName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  transformation={{ crop: 'fill', gravity: 'face' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowImageUpload(true)}
              className="absolute inset-0 w-full h-full rounded-full bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center group-hover:visible md:invisible"
            >
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 px-3 py-1 rounded-md text-sm">
                Edit
              </span>
            </button>
          </div>
          <button
            onClick={() => setShowImageUpload(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 md:hidden"
          >
            Edit Photo
          </button>
        </div>

        {/* Artist Info Section */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            {artist.isAvailable && (
              <span className="text-sm text-green-600 font-medium">• Available</span>
            )}
          </div>
          
          <div className="flex justify-center md:justify-start mb-3">
            <RatingStars rating={averageRating} totalReviews={totalReviews} />
          </div>
          
          {artist.location && (
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{artist.location}</span>
            </div>
          )}
          
          {artist.badges.length > 0 && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {artist.badges.map((badge, index) => (
                <span 
                  key={index} 
                  className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bio Section - New Column */}
        {artist.bio && (
          <div className="md:flex-1 text-center md:text-left">
            <div className="text-gray-600 text-sm">
              <p className="leading-relaxed">
                {isBioExpanded ? artist.bio : truncatedBio}
              </p>
              {artist.bio.length > 150 && (
                <button
                  onClick={() => setIsBioExpanded(!isBioExpanded)}
                  className="text-blue-600 hover:text-blue-700 mt-1 text-sm font-medium"
                >
                  {isBioExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Image Upload Modal */}
      {showImageUpload && (
        <ProfileImageUpload
          artistId={artist.id}
          currentImage={artist.profileImage}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  )
}