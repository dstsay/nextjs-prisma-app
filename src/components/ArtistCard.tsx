'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageCarousel from './ImageCarousel';
import RatingStars from './RatingStars';
import CloudinaryImage from '../../components/CloudinaryImage';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    portfolioImages: string[];
    location: string | null;
    badges: string[];
    bio: string | null;
    specialties: string[];
    hourlyRate: number | null;
    isAvailable: boolean;
  };
  averageRating: number;
  totalReviews: number;
}

export default function ArtistCard({ artist, averageRating, totalReviews }: ArtistCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  
  const truncatedBio = artist.bio && artist.bio.length > 150 
    ? artist.bio.substring(0, 150) + '...' 
    : artist.bio;

  // Display name with firstName and lastName, fallback to name field
  const displayName = artist.firstName || artist.lastName 
    ? `${artist.firstName || ''} ${artist.lastName || ''}`.trim()
    : artist.name;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="relative h-64">
          <ImageCarousel images={artist.portfolioImages} />
          {artist.profileImage && (
            <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden">
              <CloudinaryImage
                publicId={artist.profileImage}
                alt={displayName}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                transformation={{ crop: 'fill', gravity: 'face' }}
              />
            </div>
          )}
          {artist.badges.includes("Sponsored") && (
            <span className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Sponsored
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-1">{displayName}</h3>
          <RatingStars rating={averageRating} totalReviews={totalReviews} />
          
          {artist.badges.filter(b => b !== "Sponsored").map((badge, index) => (
            <div key={index} className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <span className="text-primary">✓</span>
              {badge}
            </div>
          ))}
          
          {artist.location && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {artist.location}
            </div>
          )}
          
          <button 
            onClick={() => router.push(`/artists/${artist.id}/book`)}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
          >
            Book Session
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <div className="w-2/5 h-64 relative">
          <ImageCarousel images={artist.portfolioImages} />
        </div>
        
        <div className="flex-1 p-6 flex">
          <div className="flex-1 pr-4">
            <div className="flex items-start gap-4 mb-4">
              {artist.profileImage && (
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <CloudinaryImage
                    publicId={artist.profileImage}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    transformation={{ crop: 'fill', gravity: 'face' }}
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold mb-1">{displayName}</h3>
                <RatingStars rating={averageRating} totalReviews={totalReviews} />
                {artist.location && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {artist.location}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {artist.badges.map((badge, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {badge}
                </span>
              ))}
            </div>
            
            {artist.bio && (
              <div className="text-gray-600 text-sm">
                <p>{isExpanded ? artist.bio : truncatedBio}</p>
                {artist.bio.length > 150 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary hover:underline mt-1"
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}
            
            {artist.specialties.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700">Specialties: </span>
                <span className="text-sm text-gray-600">{artist.specialties.join(', ')}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <button 
              onClick={() => router.push(`/artists/${artist.id}/book`)}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Book Session
            </button>
            {artist.badges.includes("Sponsored") && (
              <span className="text-xs text-gray-500 mt-2">Sponsored</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}