'use client';

import CloudinaryImage from '../CloudinaryImage';
import RatingStars from '../../src/components/RatingStars';
import { BackButton } from './BackButton';

interface ArtistBookingProfileProps {
  artist: {
    id: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    location: string | null;
    bio: string | null;
    specialties: string[];
    badges: string[];
    hourlyRate: number | null;
  };
  averageRating: number;
  totalReviews: number;
}

export function ArtistBookingProfile({ artist, averageRating, totalReviews }: ArtistBookingProfileProps) {
  const displayName = artist.firstName || artist.lastName 
    ? `${artist.firstName || ''} ${artist.lastName || ''}`.trim()
    : artist.name;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full w-full flex flex-col">
      <div className="mb-4">
        <BackButton />
      </div>
      <div className="text-center mb-4">
        {artist.profileImage && (
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4">
            <CloudinaryImage
              publicId={artist.profileImage}
              alt={displayName}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              transformation={{ crop: 'fill', gravity: 'face' }}
            />
          </div>
        )}
        
        <h3 className="text-xl font-bold mb-2">{displayName}</h3>
        
        {artist.location && (
          <p className="text-gray-600 text-sm mb-2 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {artist.location}
          </p>
        )}
        
        <div className="flex justify-center">
          <RatingStars rating={averageRating} totalReviews={totalReviews} />
        </div>
      </div>

      <div className="flex-1 space-y-4 hidden lg:block">
        {artist.bio && (
          <div>
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-gray-600 text-sm line-clamp-4">{artist.bio}</p>
          </div>
        )}

        {artist.specialties.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {artist.specialties.map((specialty, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {artist.badges.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Credentials</h4>
            <div className="space-y-2">
              {artist.badges.map((badge, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600 mr-2">✓</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {artist.hourlyRate && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Session Rate</span>
            <span className="text-xl font-bold text-green-600">${artist.hourlyRate}/hour</span>
          </div>
        </div>
      )}
    </div>
  );
}