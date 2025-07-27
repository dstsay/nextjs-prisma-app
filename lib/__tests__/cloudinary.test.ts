import { v2 as cloudinary } from 'cloudinary';
import {
  uploadImage,
  uploadImageFromUrl,
  deleteImage,
  getOptimizedUrl,
  getResponsiveUrls,
  getPlaceholderUrl,
  isValidImageType,
  isValidFileSize,
  generatePublicId,
  createUploadSignature,
  getImageMetadata,
  defaultTransformations,
} from '../cloudinary';

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
    url: jest.fn(),
    utils: {
      api_sign_request: jest.fn(),
    },
    api: {
      resource: jest.fn(),
    },
  },
}));

describe('Cloudinary Service', () => {
  const mockUploadResult = {
    public_id: 'test_image_123',
    version: 1234567890,
    signature: 'test_signature',
    width: 1200,
    height: 800,
    format: 'jpg',
    resource_type: 'image',
    created_at: '2024-01-01T00:00:00Z',
    tags: ['test'],
    bytes: 123456,
    type: 'upload',
    etag: 'test_etag',
    placeholder: false,
    url: 'http://res.cloudinary.com/test/image/upload/test_image_123.jpg',
    secure_url: 'https://res.cloudinary.com/test/image/upload/test_image_123.jpg',
    original_filename: 'test_image',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';
  });

  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      const result = await uploadImage('/path/to/image.jpg', {
        folder: 'test_folder',
        tags: ['test', 'upload'],
      });

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/path/to/image.jpg', {
        folder: 'test_folder',
        tags: ['test', 'upload'],
        resource_type: 'auto',
      });
      expect(result).toEqual(mockUploadResult);
    });

    it('should use default folder if not specified', async () => {
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      await uploadImage('/path/to/image.jpg');

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('/path/to/image.jpg', {
        folder: 'goldiegrace',
        resource_type: 'auto',
      });
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      (cloudinary.uploader.upload as jest.Mock).mockRejectedValue(error);

      await expect(uploadImage('/path/to/image.jpg')).rejects.toThrow('Failed to upload image: Upload failed');
    });
  });

  describe('uploadImageFromUrl', () => {
    it('should upload an image from URL', async () => {
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValue(mockUploadResult);

      const result = await uploadImageFromUrl('https://example.com/image.jpg', {
        folder: 'portfolio',
        public_id: 'custom_id',
      });

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith('https://example.com/image.jpg', {
        folder: 'portfolio',
        public_id: 'custom_id',
        resource_type: 'auto',
      });
      expect(result).toEqual(mockUploadResult);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image successfully', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });

      const result = await deleteImage('test_image_123');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test_image_123');
      expect(result).toBe(true);
    });

    it('should return false on delete failure', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'not found' });

      const result = await deleteImage('non_existent_image');

      expect(result).toBe(false);
    });

    it('should handle delete errors', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const result = await deleteImage('test_image_123');

      expect(result).toBe(false);
    });
  });

  describe('getOptimizedUrl', () => {
    it('should generate optimized URL with default transformation', () => {
      const mockUrl = 'https://res.cloudinary.com/test/image/upload/optimized/test_image.jpg';
      (cloudinary.url as jest.Mock).mockReturnValue(mockUrl);

      const url = getOptimizedUrl('test_image');

      expect(cloudinary.url).toHaveBeenCalledWith('test_image', {
        secure: true,
        transformation: [defaultTransformations.portfolio],
      });
      expect(url).toBe(mockUrl);
    });

    it('should generate optimized URL with custom transformation', () => {
      const mockUrl = 'https://res.cloudinary.com/test/image/upload/custom/test_image.jpg';
      (cloudinary.url as jest.Mock).mockReturnValue(mockUrl);

      const customTransform = { width: 500, height: 500, crop: 'fill' };
      const url = getOptimizedUrl('test_image', customTransform);

      expect(cloudinary.url).toHaveBeenCalledWith('test_image', {
        secure: true,
        transformation: [customTransform],
      });
      expect(url).toBe(mockUrl);
    });
  });

  describe('getResponsiveUrls', () => {
    it('should generate responsive image URLs', () => {
      (cloudinary.url as jest.Mock).mockImplementation((publicId, options) => {
        const width = options.transformation[0].width;
        return `https://res.cloudinary.com/test/image/upload/w_${width}/test_image.jpg`;
      });

      const result = getResponsiveUrls('test_image');

      expect(result.srcSet).toContain('320w');
      expect(result.srcSet).toContain('640w');
      expect(result.srcSet).toContain('1536w');
      expect(result.sizes).toBe('(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');
      expect(result.src).toContain('w_1024');
    });
  });

  describe('getPlaceholderUrl', () => {
    it('should generate blur placeholder URL', () => {
      const mockUrl = 'https://res.cloudinary.com/test/image/upload/blur/test_image.jpg';
      (cloudinary.url as jest.Mock).mockReturnValue(mockUrl);

      const url = getPlaceholderUrl('test_image');

      expect(cloudinary.url).toHaveBeenCalledWith('test_image', {
        secure: true,
        transformation: [
          {
            width: 30,
            quality: 10,
            effect: 'blur:1000',
            format: 'auto',
          },
        ],
      });
      expect(url).toBe(mockUrl);
    });
  });

  describe('isValidImageType', () => {
    it('should validate correct image types', () => {
      expect(isValidImageType('image.jpg')).toBe(true);
      expect(isValidImageType('image.jpeg')).toBe(true);
      expect(isValidImageType('image.png')).toBe(true);
      expect(isValidImageType('image.gif')).toBe(true);
      expect(isValidImageType('image.webp')).toBe(true);
      expect(isValidImageType('IMAGE.JPG')).toBe(true);
    });

    it('should reject invalid image types', () => {
      expect(isValidImageType('document.pdf')).toBe(false);
      expect(isValidImageType('video.mp4')).toBe(false);
      expect(isValidImageType('file.txt')).toBe(false);
      expect(isValidImageType('image')).toBe(false);
    });
  });

  describe('isValidFileSize', () => {
    it('should validate file size within limit', () => {
      const tenMB = 10 * 1024 * 1024;
      expect(isValidFileSize(tenMB - 1)).toBe(true);
      expect(isValidFileSize(tenMB)).toBe(true);
    });

    it('should reject file size over limit', () => {
      const tenMB = 10 * 1024 * 1024;
      expect(isValidFileSize(tenMB + 1)).toBe(false);
    });

    it('should accept custom size limit', () => {
      const fiveMB = 5 * 1024 * 1024;
      expect(isValidFileSize(fiveMB - 1, 5)).toBe(true);
      expect(isValidFileSize(fiveMB + 1, 5)).toBe(false);
    });
  });

  describe('generatePublicId', () => {
    it('should generate unique public ID with default prefix', () => {
      const id1 = generatePublicId();
      const id2 = generatePublicId();

      expect(id1).toMatch(/^img_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^img_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should generate unique public ID with custom prefix', () => {
      const id = generatePublicId('portfolio');

      expect(id).toMatch(/^portfolio_\d+_[a-z0-9]+$/);
    });
  });

  describe('createUploadSignature', () => {
    it('should create upload signature', async () => {
      const mockSignature = 'mock_signature_123';
      (cloudinary.utils.api_sign_request as jest.Mock).mockReturnValue(mockSignature);

      const result = await createUploadSignature('test_folder');

      expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
          folder: 'test_folder',
        }),
        'test_secret'
      );
      expect(result).toEqual({
        signature: mockSignature,
        timestamp: expect.any(Number),
        api_key: 'test_key',
        folder: 'test_folder',
      });
    });

    it('should use default folder if not specified', async () => {
      const mockSignature = 'mock_signature_456';
      (cloudinary.utils.api_sign_request as jest.Mock).mockReturnValue(mockSignature);

      const result = await createUploadSignature();

      expect(result.folder).toBe('goldiegrace');
    });
  });

  describe('getImageMetadata', () => {
    it('should fetch image metadata successfully', async () => {
      const mockMetadata = {
        width: 1920,
        height: 1080,
        format: 'jpg',
        bytes: 234567,
        created_at: '2024-01-01T00:00:00Z',
        public_id: 'test_image',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test_image.jpg',
      };
      (cloudinary.api.resource as jest.Mock).mockResolvedValue(mockMetadata);

      const result = await getImageMetadata('test_image');

      expect(cloudinary.api.resource).toHaveBeenCalledWith('test_image');
      expect(result).toEqual(mockMetadata);
    });

    it('should handle metadata fetch errors', async () => {
      (cloudinary.api.resource as jest.Mock).mockRejectedValue(new Error('Not found'));

      const result = await getImageMetadata('non_existent');

      expect(result).toBeNull();
    });
  });
});