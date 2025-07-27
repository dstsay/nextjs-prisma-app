// Custom Next.js image loader for Cloudinary
// This loader generates Cloudinary URLs with proper transformations

import type { ImageLoaderProps } from 'next/image';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface CloudinaryLoaderProps extends ImageLoaderProps {
  src: string; // This will be the Cloudinary public ID
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderProps): string {
  if (!CLOUD_NAME) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
    // Return a placeholder image URL
    return `https://via.placeholder.com/${width}`;
  }

  // Handle if src is already a full URL (backward compatibility)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Check if src already contains version (e.g., v1234567890/goldiegrace/...)
  const hasVersion = /^v\d+\//.test(src);
  
  // If using auto-upload mapping with version, Cloudinary will handle it
  // The version is part of the public ID path

  // Build transformation parameters
  const params: string[] = [];
  
  // Width is always provided by Next.js Image
  params.push(`w_${width}`);
  
  // Quality (Next.js default is 75)
  if (quality) {
    params.push(`q_${quality}`);
  } else {
    params.push('q_auto:good');
  }
  
  // Additional optimizations
  params.push('f_auto'); // Automatic format selection
  params.push('c_limit'); // Limit to requested dimensions
  params.push('dpr_auto'); // Automatic DPR scaling
  params.push('fl_progressive'); // Progressive loading
  
  // Join parameters
  const transformation = params.join(',');
  
  // Build the URL
  // Note: If src contains version (v123/path), it's included as part of the path
  // This supports Cloudinary's auto-upload mapping with versioning
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}/${src}`;
}

// Blur data URL generator for placeholder
export function getCloudinaryBlurDataURL(publicId: string): string {
  if (!CLOUD_NAME) {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }
  
  // Generate a low-quality blur placeholder
  const blurUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_30,q_10,e_blur:1000,f_auto/${publicId}`;
  return blurUrl;
}