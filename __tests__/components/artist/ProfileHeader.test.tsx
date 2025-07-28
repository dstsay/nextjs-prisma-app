import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileHeader } from '@/components/artist/ProfileHeader'

// Mock the ProfileImageUpload component
jest.mock('@/components/artist/ProfileImageUpload', () => ({
  ProfileImageUpload: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="profile-image-upload-modal">
      <button onClick={onClose}>Close</button>
    </div>
  )
}))

// Mock CloudinaryImage component
jest.mock('../../../components/CloudinaryImage', () => ({
  __esModule: true,
  default: ({ alt, className }: { alt: string; className?: string }) => (
    <img src="/mock-image.jpg" alt={alt} className={className} />
  )
}))

// Mock RatingStars component
jest.mock('../../../src/components/RatingStars', () => ({
  __esModule: true,
  default: ({ rating, totalReviews }: { rating: number; totalReviews: number }) => (
    <div data-testid="rating-stars">
      {rating} stars ({totalReviews} reviews)
    </div>
  )
}))

describe('ProfileHeader', () => {
  const mockArtist = {
    id: '123',
    name: 'Sarah Johnson',
    profileImage: 'artist/profile-123',
    location: 'Los Angeles, CA',
    badges: ['Certified MUA', 'Bridal Specialist'],
    bio: 'Professional makeup artist with over 10 years of experience. Specializing in bridal and editorial makeup. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    isAvailable: true
  }

  it('renders artist information correctly', () => {
    render(
      <ProfileHeader 
        artist={mockArtist} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    expect(screen.getByText('• Available')).toBeInTheDocument()
    expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument()
    expect(screen.getByText('4.5 stars (25 reviews)')).toBeInTheDocument()
    expect(screen.getByText('Certified MUA')).toBeInTheDocument()
    expect(screen.getByText('Bridal Specialist')).toBeInTheDocument()
  })

  it('shows truncated bio with show more button', () => {
    render(
      <ProfileHeader 
        artist={mockArtist} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Bio should be truncated
    expect(screen.getByText(/Professional makeup artist.*\.\.\./)).toBeInTheDocument()
    expect(screen.getByText('Show More')).toBeInTheDocument()

    // Click show more
    fireEvent.click(screen.getByText('Show More'))
    
    // Full bio should be shown
    expect(screen.getByText(/Professional makeup artist.*magna aliqua\./)).toBeInTheDocument()
    expect(screen.getByText('Show Less')).toBeInTheDocument()
  })

  it('shows edit photo button and opens modal', () => {
    render(
      <ProfileHeader 
        artist={mockArtist} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Find edit photo button (mobile version)
    const editButton = screen.getByText('Edit Photo')
    fireEvent.click(editButton)

    // Modal should be open
    expect(screen.getByTestId('profile-image-upload-modal')).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByTestId('profile-image-upload-modal')).not.toBeInTheDocument()
  })

  it('handles artist without profile image', () => {
    const artistWithoutImage = { ...mockArtist, profileImage: null }
    
    render(
      <ProfileHeader 
        artist={artistWithoutImage} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Should show placeholder icon (svg is not an img role)
    const profileImageContainer = screen.getByText('Sarah Johnson').closest('.bg-white')
    expect(profileImageContainer).toContainHTML('svg')
  })

  it('handles artist without location', () => {
    const artistWithoutLocation = { ...mockArtist, location: null }
    
    render(
      <ProfileHeader 
        artist={artistWithoutLocation} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Location should not be displayed
    expect(screen.queryByText('Los Angeles, CA')).not.toBeInTheDocument()
  })

  it('handles artist without badges', () => {
    const artistWithoutBadges = { ...mockArtist, badges: [] }
    
    render(
      <ProfileHeader 
        artist={artistWithoutBadges} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Badges should not be displayed
    expect(screen.queryByText('Certified MUA')).not.toBeInTheDocument()
    expect(screen.queryByText('Bridal Specialist')).not.toBeInTheDocument()
  })

  it('handles artist without bio', () => {
    const artistWithoutBio = { ...mockArtist, bio: null }
    
    render(
      <ProfileHeader 
        artist={artistWithoutBio} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Bio section should not be displayed
    expect(screen.queryByText('Show More')).not.toBeInTheDocument()
  })

  it('handles unavailable artist', () => {
    const unavailableArtist = { ...mockArtist, isAvailable: false }
    
    render(
      <ProfileHeader 
        artist={unavailableArtist} 
        averageRating={4.5}
        totalReviews={25}
      />
    )

    // Available status should not be displayed
    expect(screen.queryByText('• Available')).not.toBeInTheDocument()
  })
})