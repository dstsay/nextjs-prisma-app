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
const DEPLOYMENT_ID = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_BUILD_ID || 'dev';

// Generate Cloudinary URL on client side
export function getCloudinaryUrl(
  publicId: string,
  transformations: CloudinaryTransformation[] = [],
  version?: string | number
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
  let url = transformStr 
    ? `${baseUrl}/${transformStr}/${publicId}`
    : `${baseUrl}/${publicId}`;

  // Add version parameter if provided
  if (version) {
    url += `?v=${version}`;
  } else if (DEPLOYMENT_ID !== 'dev') {
    // In production, use deployment ID as cache buster
    // This ensures new deployments get fresh images
    url += `?d=${DEPLOYMENT_ID.substring(0, 8)}`;
  }

  return url;
}

// Generate optimized URL for an image
export function getOptimizedUrl(
  publicId: string,
  transformation?: CloudinaryTransformation,
  version?: string | number
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
  
  return getCloudinaryUrl(publicId, [transformation || defaultTransform], version);
}

// Generate responsive image URLs
export function getResponsiveUrls(
  publicId: string,
  baseTransformation: CloudinaryTransformation = {},
  version?: string | number
): {
  srcSet: string;
  sizes: string;
  src: string;
} {
  const widths = [320, 640, 768, 1024, 1280, 1536];
  const srcSet = widths
    .map((width) => {
      const url = getCloudinaryUrl(publicId, [{ ...baseTransformation, width, crop: 'limit' }], version);
      return `${url} ${width}w`;
    })
    .join(', ');

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  const src = getCloudinaryUrl(publicId, [{ ...baseTransformation, width: 1024 }], version);

  return { srcSet, sizes, src };
}

// Generate blur placeholder URL
export function getPlaceholderUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, [{
    width: 30,
    quality: 10,
    effect: 'blur:1000',
    format: 'auto',
  }]);
}