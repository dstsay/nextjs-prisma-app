import { NextRequest } from 'next/server';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateImageFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const expectedExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif']
  };

  const validExtensions = expectedExtensions[file.type];
  if (!extension || !validExtensions || !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'File extension does not match file type'
    };
  }

  // File name is sanitized later, no need to reject here
  // Just check for obviously malicious patterns
  if (file.name.includes('../') || file.name.includes('..\\')) {
    return {
      isValid: false,
      error: 'File name contains invalid path traversal characters'
    };
  }

  return { isValid: true };
}

export async function validateImageContent(buffer: Buffer): Promise<FileValidationResult> {
  // Check magic numbers (file signatures)
  const magicNumbers: Record<string, number[][]> = {
    jpeg: [[0xFF, 0xD8, 0xFF]],
    png: [[0x89, 0x50, 0x4E, 0x47]],
    gif: [[0x47, 0x49, 0x46, 0x38]],
    webp: [[0x52, 0x49, 0x46, 0x46]] // Partial check for WEBP
  };

  const fileSignature = buffer.slice(0, 8);
  let isValidSignature = false;

  for (const [format, signatures] of Object.entries(magicNumbers)) {
    for (const signature of signatures) {
      if (signature.every((byte, index) => fileSignature[index] === byte)) {
        isValidSignature = true;
        break;
      }
    }
    if (isValidSignature) break;
  }

  if (!isValidSignature) {
    return {
      isValid: false,
      error: 'File content does not match expected image format'
    };
  }

  return { isValid: true };
}

export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  
  // Remove only truly problematic characters, keep spaces as underscores
  // Allow: letters, numbers, spaces, dots, hyphens, underscores, parentheses
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\s\-_()]/g, '_');
  // Replace spaces with underscores for consistency
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Ensure file has an extension
  if (!sanitized.includes('.')) {
    sanitized += '.jpg'; // Default extension
  }
  
  // Limit length
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const extension = sanitized.split('.').pop() || '';
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, maxLength - extension.length - 1) + '.' + extension;
  }
  
  return sanitized;
}