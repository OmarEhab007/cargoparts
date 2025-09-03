import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { LocalStorageService } from '@/lib/storage/local-storage';

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

const testUploadsDir = path.join(__dirname, 'test-uploads');

describe('LocalStorageService', () => {
  let storageService: LocalStorageService;
  
  beforeEach(async () => {
    // Create test instance with custom uploads directory
    storageService = new LocalStorageService();
    // Override the private uploadsDir for testing
    (storageService as any).uploadsDir = testUploadsDir;
    
    await storageService.initialize();
  });
  
  afterEach(async () => {
    // Cleanup test files
    try {
      await fs.rm(testUploadsDir, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
  });

  describe('initialization', () => {
    it('should create uploads directory structure', async () => {
      await storageService.initialize();
      
      const directories = ['listings', 'profiles', 'temp', 'thumbnails'];
      
      for (const dir of directories) {
        const dirPath = path.join(testUploadsDir, dir);
        await expect(fs.access(dirPath)).resolves.not.toThrow();
      }
    });
  });

  describe('file upload', () => {
    it('should upload a valid image file', async () => {
      // Create a proper mock File with arrayBuffer method
      const fileContent = 'fake-image-content';
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: fileContent.length,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(fileContent.length))
      } as unknown as File;
      
      const result = await storageService.uploadFile(mockFile, 'temp', {
        maxFileSize: 1024 * 1024,
        allowedMimeTypes: ['image/jpeg'],
        generateThumbnail: true
      });

      expect(result).toMatchObject({
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        url: expect.stringContaining('/uploads/temp/'),
        thumbnailUrl: expect.stringContaining('/uploads/thumbnails/')
      });
      
      // Verify file was actually created
      const filePath = path.join(testUploadsDir, 'temp', result.filename);
      await expect(fs.access(filePath)).resolves.not.toThrow();
    });

    it('should reject files that are too large', async () => {
      const mockFile = {
        name: 'large.jpg',
        type: 'image/jpeg',
        size: 1000,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1000))
      } as unknown as File;
      
      await expect(
        storageService.uploadFile(mockFile, 'temp', { maxFileSize: 100 })
      ).rejects.toThrow('File size exceeds maximum');
    });

    it('should reject unsupported file types', async () => {
      const mockFile = {
        name: 'test.txt',
        type: 'text/plain',
        size: 100,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100))
      } as unknown as File;
      
      await expect(
        storageService.uploadFile(mockFile, 'temp', { allowedMimeTypes: ['image/jpeg'] })
      ).rejects.toThrow('File type text/plain not allowed');
    });
  });

  describe('file operations', () => {
    let uploadedFile: any;
    
    beforeEach(async () => {
      const mockFile = {
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 12,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(12))
      } as unknown as File;
      uploadedFile = await storageService.uploadFile(mockFile, 'temp');
    });

    it('should delete a file successfully', async () => {
      const success = await storageService.deleteFile(uploadedFile.id, 'temp');
      expect(success).toBe(true);
      
      // Verify file was deleted
      const filePath = path.join(testUploadsDir, 'temp', uploadedFile.filename);
      await expect(fs.access(filePath)).rejects.toThrow();
    });

    it('should move file between categories', async () => {
      const success = await storageService.moveFile(uploadedFile.id, 'temp', 'listings');
      expect(success).toBe(true);
      
      // Verify file moved
      const oldPath = path.join(testUploadsDir, 'temp', uploadedFile.filename);
      const newPath = path.join(testUploadsDir, 'listings', uploadedFile.filename);
      
      await expect(fs.access(oldPath)).rejects.toThrow();
      await expect(fs.access(newPath)).resolves.not.toThrow();
    });

    it('should get file info', async () => {
      const fileInfo = await storageService.getFileInfo(uploadedFile.id, 'temp');
      
      expect(fileInfo).toMatchObject({
        id: uploadedFile.id,
        filename: uploadedFile.filename,
        size: expect.any(Number),
        url: expect.stringContaining('/uploads/temp/')
      });
    });
  });

  describe('cleanup operations', () => {
    it('should clean up old temp files', async () => {
      // Create an old file
      const tempDir = path.join(testUploadsDir, 'temp');
      const oldFilePath = path.join(tempDir, 'old-file.jpg');
      await fs.writeFile(oldFilePath, 'old content');
      
      // Set file modification time to 25 hours ago
      const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await fs.utimes(oldFilePath, oldTime, oldTime);
      
      const deletedCount = await storageService.cleanupTempFiles(24);
      expect(deletedCount).toBe(1);
      
      // Verify file was deleted
      await expect(fs.access(oldFilePath)).rejects.toThrow();
    });
  });
});