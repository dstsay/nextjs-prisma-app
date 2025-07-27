import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Types
export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  original_filename: string;
}

export interface CloudinaryTransformation {
  width?: number | string;
  height?: number | string;
  crop?: string;
  quality?: string | number;
  format?: string;
  gravity?: string;
  effect?: string;
  flags?: string | string[];
  dpr?: string | number;
  fetch_format?: string;
}

// Default transformations for different use cases
export const defaultTransformations: Record<string, CloudinaryTransformation> = {
  portfolio: {
    quality: 'auto',
    format: 'auto',
    crop: 'limit',
    width: 1200,
    dpr: 'auto',
    fetch_format: 'auto',
    flags: ['progressive'],
  },
  profilePicture: {
    quality: 'auto',
    format: 'auto',
    crop: 'thumb',
    gravity: 'face',
    width: 400,
    height: 400,
    dpr: 'auto',
  },
  thumbnail: {
    quality: 'auto:eco',
    format: 'auto',
    crop: 'fill',
    width: 200,
    height: 200,
    effect: 'blur:1000',
  },
  mobile: {
    quality: 'auto:eco',
    format: 'auto',
    crop: 'limit',
    width: 600,
    flags: ['progressive', 'lossy'],
  },
};

// Upload image to Cloudinary
export async function uploadImage(
  imagePath: string,
  options: {
    folder?: string;
    public_id?: string;
    tags?: string[];
    transformation?: CloudinaryTransformation;
  } = {}
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: options.folder || 'goldiegrace',
      public_id: options.public_id,
      tags: options.tags,
      transformation: options.transformation,
      resource_type: 'auto',
    });

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Upload image from URL
export async function uploadImageFromUrl(
  imageUrl: string,
  options: {
    folder?: string;
    public_id?: string;
    tags?: string[];
  } = {}
): Promise<CloudinaryUploadResult> {
  return uploadImage(imageUrl, options);
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

// Generate optimized URL for an image
export function getOptimizedUrl(
  publicId: string,
  transformation: CloudinaryTransformation = defaultTransformations.portfolio
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [transformation],
  });
}

// Generate responsive image URLs
export function getResponsiveUrls(
  publicId: string,
  baseTransformation: CloudinaryTransformation = {}
): {
  srcSet: string;
  sizes: string;
  src: string;
} {
  const widths = [320, 640, 768, 1024, 1280, 1536];
  const srcSet = widths
    .map((width) => {
      const url = cloudinary.url(publicId, {
        secure: true,
        transformation: [{ ...baseTransformation, width, crop: 'limit' }],
      });
      return `${url} ${width}w`;
    })
    .join(', ');

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  const src = getOptimizedUrl(publicId, { ...baseTransformation, width: 1024 });

  return { srcSet, sizes, src };
}

// Generate blur placeholder URL
export function getPlaceholderUrl(publicId: string): string {
  return cloudinary.url(publicId, {
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
}

// Validate file type
export function isValidImageType(filename: string): boolean {
  const validTypes = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
  return validTypes.test(filename);
}

// Validate file size (in bytes)
export function isValidFileSize(sizeInBytes: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeInBytes <= maxSizeBytes;
}

// Generate unique public ID
export function generatePublicId(prefix: string = 'img'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

// Create signed upload parameters
export async function createUploadSignature(
  folder: string = 'goldiegrace'
): Promise<{
  signature: string;
  timestamp: number;
  api_key: string;
  folder: string;
}> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

// Get image metadata
export async function getImageMetadata(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    return null;
  }
}

// Export cloudinary instance for direct use
export { cloudinary };

export default cloudinary;