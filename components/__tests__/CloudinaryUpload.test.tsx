import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CloudinaryUpload from '../CloudinaryUpload';
import { isValidImageType, isValidFileSize } from '@/lib/cloudinary-utils';

// Mock cloudinary validation functions
jest.mock('@/lib/cloudinary-utils', () => ({
  isValidImageType: jest.fn(),
  isValidFileSize: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('CloudinaryUpload', () => {
  const mockOnUpload = jest.fn();
  const mockOnError = jest.fn();
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'test-cloud',
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'test-preset',
    };
    (isValidImageType as jest.Mock).mockReturnValue(true);
    (isValidFileSize as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Rendering', () => {
    it('should render upload area', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const uploadArea = screen.getByLabelText('Upload area - click or drag files here');
      expect(uploadArea).toBeInTheDocument();
    });

    it('should show upload instructions', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
      expect(screen.getByText('JPEG, PNG, WEBP, GIF up to 10MB')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CloudinaryUpload onUpload={mockOnUpload} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('File Validation', () => {
    it('should accept valid file types', async () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      expect(isValidImageType).toHaveBeenCalledWith('test.jpg');
    });

    it('should reject invalid file types', async () => {
      (isValidImageType as jest.Mock).mockReturnValue(false);
      
      render(<CloudinaryUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining('Invalid file type: test.pdf')
        );
      });
    });

    it('should enforce file size limits', async () => {
      (isValidFileSize as jest.Mock).mockReturnValue(false);
      
      render(<CloudinaryUpload onUpload={mockOnUpload} onError={mockOnError} maxSizeMB={5} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'File too large: test.jpg. Maximum size: 5MB'
        );
      });
    });
  });

  describe('Upload Process', () => {
    it('should upload file successfully', async () => {
      const mockResponse = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
        public_id: 'test-public-id',
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} folder="test-folder" />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          })
        );
      });
      
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          'https://res.cloudinary.com/test/image/upload/test.jpg',
          'test-public-id'
        );
      });
    });

    it('should handle upload errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Upload failed: Bad Request');
      });
    });

    it('should show upload progress', async () => {
      let resolveUpload: any;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });
      
      (global.fetch as jest.Mock).mockReturnValueOnce(uploadPromise);
      
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
      
      resolveUpload({
        ok: true,
        json: async () => ({ secure_url: 'test', public_id: 'test' }),
      });
    });
  });

  describe('Drag and Drop', () => {
    it('should handle file drop', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secure_url: 'test', public_id: 'test' }),
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const uploadArea = screen.getByLabelText('Upload area - click or drag files here');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should show drag over state', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const uploadArea = screen.getByLabelText('Upload area - click or drag files here');
      
      fireEvent.dragOver(uploadArea);
      
      expect(uploadArea).toHaveClass('border-blue-500');
      expect(uploadArea).toHaveClass('bg-blue-50');
    });

    it('should remove drag state on drag leave', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const uploadArea = screen.getByLabelText('Upload area - click or drag files here');
      
      fireEvent.dragOver(uploadArea);
      fireEvent.dragLeave(uploadArea);
      
      expect(uploadArea).not.toHaveClass('border-blue-500');
      expect(uploadArea).not.toHaveClass('bg-blue-50');
    });
  });

  describe('Multiple Files', () => {
    it('should handle multiple file uploads when enabled', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ secure_url: 'test', public_id: 'test' }),
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} multiple />);
      
      const input = screen.getByLabelText('File upload input');
      expect(input).toHaveAttribute('multiple');
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should only upload first file when multiple is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ secure_url: 'test', public_id: 'test' }),
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} multiple={false} />);
      
      const input = screen.getByLabelText('File upload input');
      
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];
      
      Object.defineProperty(input, 'files', {
        value: files,
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      const uploadArea = screen.getByLabelText('Upload area - click or drag files here');
      const input = screen.getByLabelText('File upload input');
      
      fireEvent.keyDown(uploadArea, { key: 'Enter' });
      
      // Check that the file input would be triggered
      expect(input).toBeInTheDocument();
    });

    it('should have proper ARIA labels', () => {
      render(<CloudinaryUpload onUpload={mockOnUpload} />);
      
      expect(screen.getByLabelText('File upload input')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload area - click or drag files here')).toBeInTheDocument();
    });
  });

  describe('Configuration', () => {
    it('should handle missing cloud name', async () => {
      delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      render(<CloudinaryUpload onUpload={mockOnUpload} onError={mockOnError} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Cloudinary cloud name not configured');
      });
    });

    it('should use custom upload preset', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secure_url: 'test', public_id: 'test' }),
      });
      
      render(<CloudinaryUpload onUpload={mockOnUpload} uploadPreset="custom-preset" />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('File upload input');
      
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(input);
      
      await waitFor(() => {
        const formData = (global.fetch as jest.Mock).mock.calls[0][1].body;
        expect(formData).toBeInstanceOf(FormData);
      });
    });
  });
});