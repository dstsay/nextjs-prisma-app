/**
 * @jest-environment node
 */
import { POST } from '../upload/route';
import { createUploadSignature, uploadImage } from '../../../../lib/cloudinary';

// Mock cloudinary functions
jest.mock('../../../../lib/cloudinary', () => ({
  createUploadSignature: jest.fn(),
  uploadImage: jest.fn(),
}));

// Mock NextRequest
class MockNextRequest {
  public method: string;
  public headers: {
    get: (key: string) => string | null;
  };
  public body: any;
  private _headers: Map<string, string>;
  
  constructor(url: string, init: RequestInit) {
    this.method = init.method || 'GET';
    this._headers = new Map();
    
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => {
          this._headers.set(key, value);
        });
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => {
          this._headers.set(key, value);
        });
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          this._headers.set(key, value as string);
        });
      }
    }
    
    // Mock headers.get method
    this.headers = {
      get: (key: string) => this._headers.get(key) || null
    };
    
    this.body = init.body;
  }
  
  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }
  
  async formData() {
    return this.body;
  }
}

describe('POST /api/cloudinary/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Signature Generation', () => {
    it('should generate upload signature', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        api_key: 'test-api-key',
        folder: 'test-folder',
      };
      
      (createUploadSignature as jest.Mock).mockResolvedValue(mockSignature);

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ folder: 'test-folder' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(createUploadSignature).toHaveBeenCalledWith('test-folder');
      expect(data).toEqual(mockSignature);
      expect(response.status).toBe(200);
    });

    it('should use default folder if not provided', async () => {
      const mockSignature = {
        signature: 'test-signature',
        timestamp: 1234567890,
        api_key: 'test-api-key',
        folder: 'goldiegrace',
      };
      
      (createUploadSignature as jest.Mock).mockResolvedValue(mockSignature);

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request as any);
      
      expect(createUploadSignature).toHaveBeenCalledWith(undefined);
      expect(response.status).toBe(200);
    });
  });

  describe('File Upload', () => {
    it('should upload file successfully', async () => {
      const mockUploadResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test-public-id',
        width: 1200,
        height: 800,
        format: 'jpg',
      };
      
      (uploadImage as jest.Mock).mockResolvedValue(mockUploadResult);

      const formData = new FormData();
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('folder', 'test-folder');

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        body: formData,
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(uploadImage).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        expect.objectContaining({
          folder: 'test-folder',
        })
      );
      expect(data).toEqual({
        url: mockUploadResult.secure_url,
        publicId: mockUploadResult.public_id,
        width: mockUploadResult.width,
        height: mockUploadResult.height,
        format: mockUploadResult.format,
      });
      expect(response.status).toBe(200);
    });

    it('should handle missing file', async () => {
      const formData = new FormData();
      formData.append('folder', 'test-folder');

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        body: formData,
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data).toEqual({ error: 'No file provided' });
      expect(response.status).toBe(400);
    });

    it('should use custom public ID if provided', async () => {
      const mockUploadResult = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'custom-id',
        width: 1200,
        height: 800,
        format: 'jpg',
      };
      
      (uploadImage as jest.Mock).mockResolvedValue(mockUploadResult);

      const formData = new FormData();
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);
      formData.append('publicId', 'custom-id');

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        body: formData,
      });

      await POST(request as any);

      expect(uploadImage).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          public_id: 'custom-id',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid content type', async () => {
      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: 'invalid',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data).toEqual({ error: 'Invalid content type' });
      expect(response.status).toBe(400);
    });

    it('should handle upload errors', async () => {
      (uploadImage as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      const formData = new FormData();
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data',
        },
        body: formData,
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data).toEqual({
        error: 'Upload failed',
        details: 'Upload failed',
      });
      expect(response.status).toBe(500);
    });

    it('should handle signature generation errors', async () => {
      (createUploadSignature as jest.Mock).mockRejectedValue(new Error('Signature failed'));

      const request = new MockNextRequest('http://localhost:3000/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ folder: 'test-folder' }),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(data).toEqual({
        error: 'Upload failed',
        details: 'Signature failed',
      });
      expect(response.status).toBe(500);
    });
  });
});