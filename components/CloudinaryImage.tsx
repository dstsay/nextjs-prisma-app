'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import cloudinaryLoader, { getCloudinaryBlurDataURL } from '../lib/cloudinary-loader';
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
  quality?: number;
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
  quality,
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Get blur data URL for placeholder
  const blurDataURL = getCloudinaryBlurDataURL(publicId);

  // If there's an error, use fallback
  if (hasError && fallbackSrc) {
    // Check if fallbackSrc is a public ID or a full URL
    const fallbackIsFullUrl = fallbackSrc.startsWith('http://') || fallbackSrc.startsWith('https://');
    
    return (
      <Image
        src={fallbackIsFullUrl ? fallbackSrc : fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        fill={fill}
        sizes={sizes}
        priority={priority}
        loader={fallbackIsFullUrl ? undefined : cloudinaryLoader}
      />
    );
  }

  // For fill mode
  if (fill) {
    return (
      <>
        {isLoading && (
          <div 
            className="absolute inset-0 animate-pulse bg-gray-200 rounded z-10"
            aria-hidden="true"
          />
        )}
        <Image
          src={publicId}
          alt={alt}
          fill
          className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          sizes={sizes || '100vw'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={blurDataURL}
          quality={quality || 75}
          loader={cloudinaryLoader}
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
      <Image
        src={publicId}
        alt={alt}
        width={width || 1200}
        height={height || 800}
        className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={blurDataURL}
        quality={quality || 75}
        loader={cloudinaryLoader}
      />
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
  quality,
}: Omit<CloudinaryImageProps, 'fill' | 'sizes' | 'onLoad' | 'onError' | 'fallbackSrc'>) {
  const blurDataURL = getCloudinaryBlurDataURL(publicId);

  return (
    <Image
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="blur"
      blurDataURL={blurDataURL}
      quality={quality || 75}
      loader={cloudinaryLoader}
    />
  );
}