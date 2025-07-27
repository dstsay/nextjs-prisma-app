import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CloudinaryImage, { CloudinaryImageStatic } from '../CloudinaryImage';
import { getOptimizedUrl, getResponsiveUrls, getPlaceholderUrl } from '../../lib/cloudinary-client';

// Mock the cloudinary-client lib functions
jest.mock('../../lib/cloudinary-client', () => ({
  getOptimizedUrl: jest.fn(),
  getResponsiveUrls: jest.fn(),
  getPlaceholderUrl: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, blurDataURL, ...imgProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imgProps} data-fill={fill} data-priority={priority} data-blur={blurDataURL} />;
  },
}));

describe('CloudinaryImage', () => {
  const mockPublicId = 'test-image-123';
  const mockAlt = 'Test image';
  const mockSrc = 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg';
  const mockSrcSet = 'https://res.cloudinary.com/test/image/upload/w_320/test-image-123.jpg 320w, https://res.cloudinary.com/test/image/upload/w_640/test-image-123.jpg 640w';
  const mockSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  const mockPlaceholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

  beforeEach(() => {
    jest.clearAllMocks();
    (getOptimizedUrl as jest.Mock).mockReturnValue(mockSrc);
    (getResponsiveUrls as jest.Mock).mockReturnValue({
      src: mockSrc,
      srcSet: mockSrcSet,
      sizes: mockSizes,
    });
    (getPlaceholderUrl as jest.Mock).mockReturnValue(mockPlaceholder);
  });

  describe('Rendering', () => {
    it('should render with correct Cloudinary URL', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockSrc);
    });

    it('should apply custom className', () => {
      const customClass = 'custom-image-class';
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} className={customClass} />);
      
      const container = screen.getByAltText(mockAlt).parentElement;
      expect(container).toHaveClass(customClass);
    });

    it('should pass width and height props', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} width={800} height={600} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('width', '800');
      expect(image).toHaveAttribute('height', '600');
    });

    it('should use default dimensions when not specified', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('width', '1200');
      expect(image).toHaveAttribute('height', '800');
    });
  });

  describe('Transformations', () => {
    it('should apply transformations properly', () => {
      const transformation = { width: 500, height: 500, crop: 'fill' };
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} transformation={transformation} />);
      
      expect(getResponsiveUrls).toHaveBeenCalledWith(mockPublicId, transformation);
    });

    it('should generate responsive srcSet', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('sizes', mockSizes);
    });

    it('should use custom sizes when provided', () => {
      const customSizes = '100vw';
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} sizes={customSizes} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('sizes', customSizes);
    });
  });

  describe('Loading States', () => {
    it('should show loading placeholder initially', () => {
      const { container } = render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const loadingDiv = container.querySelector('.animate-pulse');
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should hide loading placeholder after image loads', async () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      fireEvent.load(image);
      
      await waitFor(() => {
        expect(image).toHaveClass('opacity-100');
      });
    });

    it('should use blur placeholder', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('data-blur', mockPlaceholder);
      expect(image).toHaveAttribute('placeholder', 'blur');
    });
  });

  describe('Error Handling', () => {
    it('should handle loading errors', async () => {
      const onError = jest.fn();
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} onError={onError} />);
      
      const image = screen.getByAltText(mockAlt);
      fireEvent.error(image);
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it('should fall back to default image on error', async () => {
      const fallbackSrc = '/fallback.jpg';
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} fallbackSrc={fallbackSrc} />);
      
      const image = screen.getByAltText(mockAlt);
      fireEvent.error(image);
      
      await waitFor(() => {
        const fallbackImage = screen.getByAltText(mockAlt);
        expect(fallbackImage).toHaveAttribute('src', fallbackSrc);
      });
    });
  });

  describe('Callbacks', () => {
    it('should trigger onLoad callback', async () => {
      const onLoad = jest.fn();
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} onLoad={onLoad} />);
      
      const image = screen.getByAltText(mockAlt);
      fireEvent.load(image);
      
      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('Priority Loading', () => {
    it('should set priority when specified', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} priority />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('data-priority', 'true');
    });

    it('should use lazy loading by default', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Fill Mode', () => {
    it('should support fill mode', () => {
      render(<CloudinaryImage publicId={mockPublicId} alt={mockAlt} fill />);
      
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('data-fill', 'true');
    });
  });
});

describe('CloudinaryImageStatic', () => {
  const mockPublicId = 'static-image-123';
  const mockAlt = 'Static test image';
  const mockSrc = 'https://res.cloudinary.com/test/image/upload/static-image-123.jpg';
  const mockPlaceholder = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

  beforeEach(() => {
    jest.clearAllMocks();
    (getOptimizedUrl as jest.Mock).mockReturnValue(mockSrc);
    (getPlaceholderUrl as jest.Mock).mockReturnValue(mockPlaceholder);
  });

  it('should render static image with optimized URL', () => {
    render(<CloudinaryImageStatic publicId={mockPublicId} alt={mockAlt} />);
    
    const image = screen.getByAltText(mockAlt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockSrc);
  });

  it('should use default dimensions', () => {
    render(<CloudinaryImageStatic publicId={mockPublicId} alt={mockAlt} />);
    
    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveAttribute('width', '1200');
    expect(image).toHaveAttribute('height', '800');
  });

  it('should apply custom dimensions', () => {
    render(<CloudinaryImageStatic publicId={mockPublicId} alt={mockAlt} width={600} height={400} />);
    
    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveAttribute('width', '600');
    expect(image).toHaveAttribute('height', '400');
  });

  it('should apply transformations', () => {
    const transformation = { width: 300, height: 300, crop: 'thumb' };
    render(<CloudinaryImageStatic publicId={mockPublicId} alt={mockAlt} transformation={transformation} />);
    
    expect(getOptimizedUrl).toHaveBeenCalledWith(mockPublicId, transformation);
  });

  it('should include blur placeholder', () => {
    render(<CloudinaryImageStatic publicId={mockPublicId} alt={mockAlt} />);
    
    const image = screen.getByAltText(mockAlt);
    expect(image).toHaveAttribute('data-blur', mockPlaceholder);
    expect(image).toHaveAttribute('placeholder', 'blur');
  });
});