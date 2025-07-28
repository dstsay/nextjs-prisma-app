import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PortfolioManager } from '@/components/artist/PortfolioManager'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock CloudinaryImage component
jest.mock('../../../components/CloudinaryImage', () => ({
  __esModule: true,
  default: ({ alt, publicId }: { alt: string; publicId: string }) => (
    <img src={`/mock-image-${publicId}.jpg`} alt={alt} />
  )
}))

// Mock CloudinaryUpload component
jest.mock('../../../components/CloudinaryUpload', () => ({
  __esModule: true,
  default: ({ onUpload, onError }: { onUpload: (url: string, id: string) => void; onError: (err: string) => void }) => (
    <div data-testid="cloudinary-upload">
      <button onClick={() => onUpload('https://example.com/image.jpg', 'test-public-id')}>
        Upload Success
      </button>
      <button onClick={() => onError('Upload failed')}>
        Upload Error
      </button>
    </div>
  )
}))

// Mock fetch
global.fetch = jest.fn()

describe('PortfolioManager', () => {
  const mockRefresh = jest.fn()
  const mockPush = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
      push: mockPush
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders portfolio images in grid', () => {
    const portfolioImages = ['image1', 'image2', 'image3']
    
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={portfolioImages} 
      />
    )

    expect(screen.getByText('Portfolio Images (3/100)')).toBeInTheDocument()
    expect(screen.getByAltText('Portfolio image 1')).toBeInTheDocument()
    expect(screen.getByAltText('Portfolio image 2')).toBeInTheDocument()
    expect(screen.getByAltText('Portfolio image 3')).toBeInTheDocument()
  })

  it('shows empty state when no images', () => {
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={[]} 
      />
    )

    expect(screen.getByText('No portfolio images')).toBeInTheDocument()
    expect(screen.getByText('Get started by uploading your best work.')).toBeInTheDocument()
    expect(screen.getByText('Add Your First Image')).toBeInTheDocument()
  })

  it('shows add images button when slots available', () => {
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1']} 
      />
    )

    expect(screen.getByText('Add Images')).toBeInTheDocument()
  })

  it('hides add images button when at max capacity', () => {
    const maxImages = Array(100).fill(0).map((_, i) => `image${i}`)
    
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={maxImages} 
      />
    )

    expect(screen.queryByText('Add Images')).not.toBeInTheDocument()
    expect(screen.getByText('Portfolio Images (100/100)')).toBeInTheDocument()
  })

  it('toggles upload area', () => {
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1']} 
      />
    )

    // Upload area should not be visible initially
    expect(screen.queryByTestId('cloudinary-upload')).not.toBeInTheDocument()

    // Click Add Images
    fireEvent.click(screen.getByText('Add Images'))

    // Upload area should be visible
    expect(screen.getByTestId('cloudinary-upload')).toBeInTheDocument()
    expect(screen.getByText('You can add up to 99 more images.')).toBeInTheDocument()

    // Click Cancel
    fireEvent.click(screen.getByText('Cancel'))

    // Upload area should be hidden
    expect(screen.queryByTestId('cloudinary-upload')).not.toBeInTheDocument()
  })

  it('handles successful image upload', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        portfolioImages: ['image1', 'image2', 'new-image'] 
      })
    })

    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1', 'image2']} 
      />
    )

    // Open upload area
    fireEvent.click(screen.getByText('Add Images'))

    // Click upload success button
    fireEvent.click(screen.getByText('Upload Success'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/artist/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: 'test-public-id' })
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Portfolio Images (3/100)')).toBeInTheDocument()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('handles upload error from API', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' })
    })

    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1']} 
      />
    )

    // Open upload area
    fireEvent.click(screen.getByText('Add Images'))

    // Click upload success button
    fireEvent.click(screen.getByText('Upload Success'))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('handles upload error from Cloudinary', () => {
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1']} 
      />
    )

    // Open upload area
    fireEvent.click(screen.getByText('Add Images'))

    // Click upload error button
    fireEvent.click(screen.getByText('Upload Error'))

    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })

  it('handles image deletion with confirmation', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true)
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        portfolioImages: ['image1', 'image3'] 
      })
    })

    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1', 'image2', 'image3']} 
      />
    )

    // Find and click delete button for second image
    const deleteButtons = screen.getAllByLabelText('Remove image')
    fireEvent.click(deleteButtons[1])

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to remove this image from your portfolio?'
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/artist/portfolio/1', {
        method: 'DELETE'
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Portfolio Images (2/100)')).toBeInTheDocument()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('cancels deletion when user declines confirmation', () => {
    window.confirm = jest.fn(() => false)

    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1', 'image2']} 
      />
    )

    const deleteButtons = screen.getAllByLabelText('Remove image')
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles deletion error', async () => {
    window.confirm = jest.fn(() => true)
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to delete' })
    })

    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={['image1', 'image2']} 
      />
    )

    const deleteButtons = screen.getAllByLabelText('Remove image')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Failed to delete')).toBeInTheDocument()
    })
    
    // Images should remain unchanged
    expect(screen.getByText('Portfolio Images (2/100)')).toBeInTheDocument()
  })

  it('respects custom maxImages prop', () => {
    render(
      <PortfolioManager 
        artistId="123" 
        portfolioImages={Array(50).fill(0).map((_, i) => `image${i}`)} 
        maxImages={50}
      />
    )

    expect(screen.getByText('Portfolio Images (50/50)')).toBeInTheDocument()
    expect(screen.queryByText('Add Images')).not.toBeInTheDocument()
  })
})