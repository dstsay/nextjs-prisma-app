'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { isValidImageType, isValidFileSize } from '../lib/cloudinary';

interface CloudinaryUploadProps {
  onUpload: (url: string, publicId: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
  uploadPreset?: string;
}

export default function CloudinaryUpload({
  onUpload,
  onError,
  folder = 'goldiegrace/user-uploads',
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = false,
  className = '',
  uploadPreset,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleFiles = async (files: FileList) => {
    const filesToUpload = multiple ? Array.from(files) : [files[0]];

    for (const file of filesToUpload) {
      // Validate file type
      if (!isValidImageType(file.name)) {
        onError?.(`Invalid file type: ${file.name}. Accepted types: ${acceptedTypes.join(', ')}`);
        continue;
      }

      // Validate file size
      if (!isValidFileSize(file.size, maxSizeMB)) {
        onError?.(`File too large: ${file.name}. Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!cloudName) {
      onError?.('Cloudinary cloud name not configured');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset || 'ml_default');
    
    if (folder) {
      formData.append('folder', folder);
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      onUpload(data.secure_url, data.public_id);
      setUploadProgress(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      onError?.(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-label="File upload input"
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!isUploading ? openFileDialog : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFileDialog();
          }
        }}
        aria-label="Upload area - click or drag files here"
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}