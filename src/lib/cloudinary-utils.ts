// Client-safe Cloudinary utility functions (no Node.js dependencies)

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

// Get Cloudinary URL with transformations
export function getCloudinaryUrl(publicId: string, options: Record<string, any> = {}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error('Cloudinary cloud name not configured');
    return '';
  }

  const transformations = Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations ? transformations + '/' : ''}${publicId}`;
}

// Extract public ID from Cloudinary URL
export function extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
  try {
    // Pattern to match Cloudinary URLs
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/subfolder/image.jpg
    const pattern = /https?:\/\/res\.cloudinary\.com\/[^\/]+\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/;
    const match = cloudinaryUrl.match(pattern);
    
    if (match && match[1]) {
      // Remove file extension if present
      return match[1].replace(/\.[^/.]+$/, '');
    }
    
    // If it's not a full URL, assume it's already a public ID
    if (!cloudinaryUrl.startsWith('http')) {
      return cloudinaryUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}