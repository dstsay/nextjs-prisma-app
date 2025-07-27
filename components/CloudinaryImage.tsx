'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getOptimizedUrl, getResponsiveUrls, getPlaceholderUrl } from '../lib/cloudinary-client';
import type { CloudinaryTransformation } from '../lib/cloudinary-client';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  transformation?: CloudinaryTransformation;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  usePublicIdAsUrl?: boolean; // Allow using publicId as full URL for backward compatibility
  version?: string | number; // Optional version/cache-busting parameter
}

export default function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  transformation,
  className,
  priority = false,
  fill = false,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg',
  usePublicIdAsUrl = false,
  version,
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if publicId is actually a full URL (for backward compatibility)
  const isFullUrl = publicId.startsWith('http://') || publicId.startsWith('https://');
  
  // Generate URLs
  let src: string;
  let srcSet: string;
  let defaultSizes: string;
  let placeholderUrl: string;
  
  if (usePublicIdAsUrl || isFullUrl) {
    // Use publicId as full URL directly
    src = publicId;
    srcSet = '';
    defaultSizes = sizes || '100vw';
    placeholderUrl = publicId; // Use same URL as placeholder
  } else {
    // Use Cloudinary transformation with version support
    const responsive = getResponsiveUrls(publicId, transformation, version);
    src = responsive.src;
    srcSet = responsive.srcSet;
    defaultSizes = responsive.sizes;
    placeholderUrl = getPlaceholderUrl(publicId);
  }

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // If there's an error, use fallback
  if (hasError && fallbackSrc) {
    // Check if fallbackSrc is a public ID or a full URL
    const fallbackIsFullUrl = fallbackSrc.startsWith('http://') || fallbackSrc.startsWith('https://');
    const fallbackUrl = fallbackIsFullUrl ? fallbackSrc : getOptimizedUrl(fallbackSrc, transformation, version);
    
    return (
      <Image
        src={fallbackUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        fill={fill}
        sizes={sizes || defaultSizes}
        priority={priority}
      />
    );
  }

  // For fill mode, don't wrap in a div to allow proper absolute positioning
  if (fill && srcSet) {
    return (
      <>
        {isLoading && (
          <div 
            className="absolute inset-0 animate-pulse bg-gray-200 rounded z-10"
            aria-hidden="true"
          />
        )}
        <Image
          src={src}
          alt={alt}
          fill
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          sizes={sizes || defaultSizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholderUrl}
          quality={90}
          loading={priority ? undefined : 'lazy'}
        />
      </>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 animate-pulse bg-gray-200 rounded"
          aria-hidden="true"
        />
      )}
      {srcSet ? (
        <Image
          src={src}
          alt={alt}
          {...(fill ? { fill: true } : { width: width || 1200, height: height || 800 })}
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          sizes={sizes || defaultSizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholderUrl}
          quality={90}
          loading={priority ? undefined : 'lazy'}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          style={fill ? { position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' } : undefined}
        />
      )}
    </div>
  );
}

// Simplified version for static optimization
export function CloudinaryImageStatic({
  publicId,
  alt,
  width = 1200,
  height = 800,
  transformation,
  className,
  priority = false,
  version,
}: Omit<CloudinaryImageProps, 'fill' | 'sizes' | 'onLoad' | 'onError' | 'fallbackSrc'>) {
  const src = getOptimizedUrl(publicId, transformation, version);
  const placeholderUrl = getPlaceholderUrl(publicId);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL={placeholderUrl}
      quality={90}
      loading={priority ? undefined : 'lazy'}
    />
  );
}