import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE } from '@/app/api/upload/route';
import { promises as fs } from 'fs';
import path from 'path';

// Mock environment
vi.mock('@/lib/env.mjs', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
  }
}));

// Mock Sharp
vi.mock('sharp', () => ({
  default: vi.fn().mockImplementation(() => ({
    jpeg: vi.fn().mockReturnThis(),
    resize: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed-image'))
  }))
}));

const testUploadsDir = path.join(process.cwd(), 'public', 'test-uploads');

describe('/api/upload', () => {
  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
  });

  describe('POST /api/upload', () => {
    it('should upload a file successfully', async () => {
      // Create mock file
      const fileContent = 'fake-image-content';
      const mockFile = new File([fileContent], 'test.jpg', { type: 'image/jpeg' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('options', JSON.stringify({
        category: 'temp',
        generateThumbnail: true
      }));

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toMatchObject({
        id: expect.any(String),
        filename: expect.stringContaining('.jpg'),
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        url: expect.stringContaining('/uploads/temp/'),
        thumbnailUrl: expect.stringContaining('/uploads/thumbnails/')
      });
    });

    it('should reject upload without file', async () => {
      const formData = new FormData();
      
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('No file provided');
    });

    it('should validate file options', async () => {
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('options', 'invalid-json');

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid options format');
    });

    it('should handle different file categories', async () => {
      const mockFile = new File(['content'], 'profile.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('options', JSON.stringify({
        category: 'profiles',
        generateThumbnail: false
      }));

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.url).toContain('/uploads/profiles/');
      expect(result.thumbnailUrl).toBeUndefined();
    });
  });

  describe('DELETE /api/upload', () => {
    it('should delete a file successfully', async () => {
      // First upload a file
      const mockFile = new File(['content'], 'delete-test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', mockFile);
      
      const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });

      const uploadResponse = await POST(uploadRequest);
      const uploadResult = await uploadResponse.json();

      // Now delete the file
      const deleteRequest = new NextRequest(
        `http://localhost:3000/api/upload?fileId=${uploadResult.id}&category=temp`,
        { method: 'DELETE' }
      );

      const deleteResponse = await DELETE(deleteRequest);
      const deleteResult = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteResult.message).toBe('File deleted successfully');
    });

    it('should return 404 for non-existent file', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/upload?fileId=non-existent&category=temp',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('File not found');
    });

    it('should require fileId parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/upload?category=temp',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('File ID required');
    });
  });
});