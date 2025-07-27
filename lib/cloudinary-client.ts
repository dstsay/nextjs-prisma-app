// Client-side Cloudinary utilities
// This file only uses NEXT_PUBLIC_ environment variables

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

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// Generate Cloudinary URL on client side
export function getCloudinaryUrl(
  publicId: string,
  transformations: CloudinaryTransformation[] = []
): string {
  if (!CLOUD_NAME) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    return publicId; // Return publicId as fallback
  }

  // Build transformation string
  const transformStr = transformations
    .map(t => {
      const parts = [];
      if (t.width) parts.push(`w_${t.width}`);
      if (t.height) parts.push(`h_${t.height}`);
      if (t.crop) parts.push(`c_${t.crop}`);
      if (t.quality) parts.push(`q_${t.quality}`);
      if (t.format) parts.push(`f_${t.format}`);
      if (t.gravity) parts.push(`g_${t.gravity}`);
      if (t.effect) parts.push(`e_${t.effect}`);
      if (t.dpr) parts.push(`dpr_${t.dpr}`);
      if (t.fetch_format) parts.push(`f_${t.fetch_format}`);
      if (t.flags) {
        const flagStr = Array.isArray(t.flags) ? t.flags.join('.') : t.flags;
        parts.push(`fl_${flagStr}`);
      }
      return parts.join(',');
    })
    .filter(Boolean)
    .join('/');

  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  const url = transformStr 
    ? `${baseUrl}/${transformStr}/${publicId}`
    : `${baseUrl}/${publicId}`;

  return url;
}

// Generate optimized URL for an image
export function getOptimizedUrl(
  publicId: string,
  transformation?: CloudinaryTransformation
): string {
  const defaultTransform: CloudinaryTransformation = {
    quality: 'auto',
    format: 'auto',
    crop: 'limit',
    width: 1200,
    dpr: 'auto',
    fetch_format: 'auto',
    flags: ['progressive'],
  };
  
  const url = getCloudinaryUrl(publicId, [transformation || defaultTransform]);
  // Add cache-busting parameter to force fresh load
  // This can be removed once images are stable
  return url + '?t=' + new Date().getTime();
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
  const timestamp = new Date().getTime();
  const srcSet = widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, [{ ...baseTransformation, width, crop: 'limit' }]);
      return `${url}?t=${timestamp} ${width}w`;
    })
    .join(', ');

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  const src = getCloudinaryUrl(publicId, [{ ...baseTransformation, width: 1024 }]) + '?t=' + timestamp;

  return { srcSet, sizes, src };
}

// Generate blur placeholder URL
export function getPlaceholderUrl(publicId: string): string {
  const url = getCloudinaryUrl(publicId, [{
    width: 30,
    quality: 10,
    effect: 'blur:1000',
    format: 'auto',
  }]);
  return url + '?t=' + new Date().getTime();
}