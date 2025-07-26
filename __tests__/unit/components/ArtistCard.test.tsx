/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '../../utils/testHelpers';
import { mockMediaQuery } from '../../utils/testHelpers';
import ArtistCard from '@/components/ArtistCard';

// Mock child components
jest.mock('@/components/ImageCarousel', () => ({
  __esModule: true,
  default: ({ images }: { images: string[] }) => (
    <div data-testid="image-carousel">{images[0]}</div>
  ),
}));

jest.mock('@/components/RatingStars', () => ({
  __esModule: true,
  default: ({ rating, totalReviews }: { rating: number; totalReviews?: number }) => (
    <div data-testid="rating-stars">
      {rating} stars {totalReviews && `(${totalReviews} reviews)`}
    </div>
  ),
}));

describe('ArtistCard Component', () => {
  const mockArtist = {
    id: '1',
    name: 'Jane Doe',
    profileImage: '/images/profile.jpg',
    portfolioImages: ['/images/portfolio1.jpg', '/images/portfolio2.jpg'],
    location: 'New York, NY',
    badges: ['Certified Pro', 'Best of Beauty 2024', 'Sponsored'],
    bio: 'Professional makeup artist with over 10 years of experience specializing in bridal and special event makeup. Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a long bio that should be truncated.',
    specialties: ['Bridal', 'Editorial', 'Special Effects'],
    hourlyRate: 150,
    isAvailable: true,
  };

  describe('Desktop Layout', () => {
    beforeEach(() => {
      mockMediaQuery(false); // Not mobile
    });

    it('should render artist information correctly', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // Artist name appears in both mobile and desktop layouts
      const nameElements = screen.getAllByText('Jane Doe');
      expect(nameElements.length).toBeGreaterThan(0);
      
      const ratingElements = screen.getAllByText('4.5 stars (25 reviews)');
      expect(ratingElements.length).toBeGreaterThan(0);
      const locationElements = screen.getAllByText(/New York, NY/);
      expect(locationElements.length).toBeGreaterThan(0);
      const bookButtons = screen.getAllByRole('button', { name: 'Book Session' });
      expect(bookButtons.length).toBeGreaterThan(0);
    });

    it('should display profile image', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const profileImages = screen.getAllByAltText('Jane Doe');
      expect(profileImages.length).toBeGreaterThan(0);
      expect(profileImages[0]).toHaveAttribute('src', '/images/profile.jpg');
    });

    it('should display badges correctly', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // Badges appear in multiple places, so use getAllBy
      expect(screen.getAllByText('Certified Pro').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Best of Beauty 2024').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Sponsored').length).toBeGreaterThan(0);
    });

    it('should display specialties', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      expect(screen.getByText('Specialties:')).toBeInTheDocument();
      expect(screen.getByText('Bridal, Editorial, Special Effects')).toBeInTheDocument();
    });

    it('should truncate long bio and show Read More button', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // Bio should be truncated (ends with ...)
      expect(screen.getByText(/Professional makeup artist.*\.\.\./)).toBeInTheDocument();
      expect(screen.getByText('Read More')).toBeInTheDocument();
      
      // The full ending of the bio should not be visible when truncated
      expect(screen.queryByText(/This is a long bio that should be truncated/)).not.toBeInTheDocument();
    });

    it('should expand bio when Read More clicked', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const readMoreButton = screen.getByText('Read More');
      fireEvent.click(readMoreButton);

      // Full bio should now be visible
      expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
      expect(screen.getByText('Read Less')).toBeInTheDocument();
    });

    it('should not show Read More for short bio', () => {
      const shortBioArtist = {
        ...mockArtist,
        bio: 'Short bio text',
      };

      render(<ArtistCard artist={shortBioArtist} averageRating={4.5} totalReviews={25} />);

      expect(screen.getByText('Short bio text')).toBeInTheDocument();
      expect(screen.queryByText('Read More')).not.toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimalArtist = {
        ...mockArtist,
        profileImage: null,
        location: null,
        bio: null,
        badges: [],
        specialties: [],
      };

      render(<ArtistCard artist={minimalArtist} averageRating={0} totalReviews={0} />);

      const nameElements = screen.getAllByText('Jane Doe');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(screen.queryByAltText('Jane Doe')).not.toBeInTheDocument();
      expect(screen.queryByText(/New York/)).not.toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    beforeEach(() => {
      mockMediaQuery(true); // Mobile view
    });

    it('should render mobile layout with stacked elements', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // Mobile layout should be visible
      const nameElements = screen.getAllByText('Jane Doe');
      const mobileLayout = nameElements[0].closest('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();

      // Desktop layout should be hidden
      const desktopLayout = document.querySelector('.hidden.md\\:flex');
      expect(desktopLayout).toBeInTheDocument();
    });

    it('should display profile image overlay on carousel in mobile', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const profileImages = screen.getAllByAltText('Jane Doe');
      // Find the mobile profile image with absolute positioning
      const mobileProfileImage = profileImages.find(img => 
        img.classList.contains('absolute') && 
        img.classList.contains('bottom-4') && 
        img.classList.contains('left-4')
      );
      expect(mobileProfileImage).toBeTruthy();
      expect(mobileProfileImage).toHaveAttribute('src', '/images/profile.jpg');
    });

    it('should show sponsored badge on carousel in mobile', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // In mobile, sponsored badge appears on the carousel
      const sponsoredBadge = screen.getAllByText('Sponsored')[0];
      expect(sponsoredBadge).toHaveClass('absolute', 'top-4', 'right-4');
    });

    it('should display full-width book button in mobile', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const bookButtons = screen.getAllByRole('button', { name: 'Book Session' });
      // Find the mobile button (w-full class)
      const mobileButton = bookButtons.find(btn => btn.classList.contains('w-full'));
      expect(mobileButton).toBeTruthy();
    });

    it('should display badges with checkmarks in mobile', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      // Look for badges with checkmarks (excluding Sponsored which appears differently)
      const badges = screen.getAllByText('✓');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Common Functionality', () => {
    it('should render ImageCarousel with portfolio images', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const carousels = screen.getAllByTestId('image-carousel');
      expect(carousels.length).toBeGreaterThan(0);
      expect(carousels[0]).toHaveTextContent('/images/portfolio1.jpg');
    });

    it('should handle click on Book Session button', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const bookButtons = screen.getAllByRole('button', { name: 'Book Session' });
      expect(bookButtons.length).toBeGreaterThan(0);
      
      // Button should be clickable (no error on click)
      fireEvent.click(bookButtons[0]);
    });

    it('should apply hover effect on card', () => {
      render(<ArtistCard artist={mockArtist} averageRating={4.5} totalReviews={25} />);

      const nameElements = screen.getAllByText('Jane Doe');
      const card = nameElements[0].closest('.bg-white');
      expect(card).toHaveClass('hover:shadow-xl');
    });
  });
});