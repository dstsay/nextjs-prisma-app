import { NextRequest, NextResponse } from 'next/server';
import { createUploadSignature, uploadImage } from '../../../../lib/cloudinary';
import { validateImageFile, validateImageContent, sanitizeFileName } from '@/lib/file-validation';
import { validateCSRFToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(request);
    if (!isValidCSRF) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
    const contentType = request.headers.get('content-type') || '';

    // Handle signature request
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { folder } = body;

      const signature = await createUploadSignature(folder);
      
      return NextResponse.json(signature);
    }

    // Handle direct upload (server-side)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const folder = formData.get('folder') as string;
      const publicId = formData.get('publicId') as string;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      // Validate file
      const fileValidation = validateImageFile(file);
      if (!fileValidation.isValid) {
        return NextResponse.json(
          { error: fileValidation.error },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate file content
      const contentValidation = await validateImageContent(buffer);
      if (!contentValidation.isValid) {
        return NextResponse.json(
          { error: contentValidation.error },
          { status: 400 }
        );
      }

      // Create a data URL from the buffer
      const fileType = file.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${fileType};base64,${base64}`;

      // Sanitize public ID if provided
      const sanitizedPublicId = publicId ? sanitizeFileName(publicId) : undefined;

      // Upload to Cloudinary
      const result = await uploadImage(dataUrl, {
        folder: folder || 'goldiegrace/uploads',
        public_id: sanitizedPublicId
      });

      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}