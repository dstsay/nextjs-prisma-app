/* eslint-disable jsx-a11y/alt-text */
"use client";

import CloudinaryImage from "../../../components/CloudinaryImage";
import { useEffect, useState } from "react";

const ImageFallback = (props: any) => {
  const { src, fallback, ...rest } = props;
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  // If no src is provided, don't render the image
  if (!imgSrc && !fallback) {
    return null;
  }

  // Default fallback public ID
  const fallbackPublicId = "goldiegrace/static/placeholder";

  // Check if src is a Cloudinary public ID or a full URL
  const isCloudinaryPublicId = imgSrc && !imgSrc.startsWith('http');

  if (isCloudinaryPublicId && !hasError) {
    return (
      <CloudinaryImage
        {...rest}
        publicId={imgSrc}
        fallbackSrc={fallbackPublicId}
        onError={() => setHasError(true)}
      />
    );
  }

  // For full URLs or error cases, use CloudinaryImage with usePublicIdAsUrl
  return (
    <CloudinaryImage
      {...rest}
      publicId={hasError ? fallbackPublicId : (imgSrc || fallback || fallbackPublicId)}
      usePublicIdAsUrl={!hasError && imgSrc && imgSrc.startsWith('http')}
    />
  );
};

export default ImageFallback;