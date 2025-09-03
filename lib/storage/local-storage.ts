import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { env } from '@/lib/env.mjs';

export interface UploadOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  quality?: number;
}

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
}

export class LocalStorageService {
  private readonly uploadsDir: string;
  private readonly baseUrl: string;
  
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    this.baseUrl = env.NEXT_PUBLIC_APP_URL;
  }

  async initialize(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      
      const subdirs = ['listings', 'profiles', 'temp', 'thumbnails'];
      await Promise.all(
        subdirs.map(dir => 
          fs.mkdir(path.join(this.uploadsDir, dir), { recursive: true })
        )
      );
    }
  }

  async uploadFile(
    file: File,
    category: 'listings' | 'profiles' | 'temp' = 'temp',
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      maxFileSize = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
      generateThumbnail = true,
      thumbnailSize = { width: 300, height: 300 },
      quality = 85
    } = options;

    if (file.size > maxFileSize) {
      throw new Error(`File size exceeds maximum of ${maxFileSize} bytes`);
    }

    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`);
    }

    await this.initialize();

    const fileId = crypto.randomUUID();
    const extension = this.getFileExtension(file.name);
    const filename = `${fileId}${extension}`;
    const categoryDir = path.join(this.uploadsDir, category);
    const filePath = path.join(categoryDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    let processedBuffer = buffer;
    
    if (file.type.startsWith('image/')) {
      processedBuffer = await sharp(buffer)
        .jpeg({ quality, progressive: true })
        .toBuffer();
    }

    await fs.writeFile(filePath, processedBuffer);

    const result: UploadResult = {
      id: fileId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: processedBuffer.length,
      path: filePath,
      url: `${this.baseUrl}/uploads/${category}/${filename}`
    };

    if (generateThumbnail && file.type.startsWith('image/')) {
      const thumbnailFilename = `thumb_${filename}`;
      const thumbnailPath = path.join(this.uploadsDir, 'thumbnails', thumbnailFilename);
      
      await sharp(buffer)
        .resize(thumbnailSize.width, thumbnailSize.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer()
        .then(thumbBuffer => fs.writeFile(thumbnailPath, thumbBuffer));

      result.thumbnailUrl = `${this.baseUrl}/uploads/thumbnails/${thumbnailFilename}`;
    }

    return result;
  }

  async deleteFile(fileId: string, category: 'listings' | 'profiles' | 'temp' = 'temp'): Promise<boolean> {
    try {
      const files = await fs.readdir(path.join(this.uploadsDir, category));
      const targetFile = files.find(file => file.startsWith(fileId));
      
      if (!targetFile) return false;

      const filePath = path.join(this.uploadsDir, category, targetFile);
      const thumbnailPath = path.join(this.uploadsDir, 'thumbnails', `thumb_${targetFile}`);

      await fs.unlink(filePath);
      
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail might not exist
      }

      return true;
    } catch {
      return false;
    }
  }

  async moveFile(
    fileId: string,
    fromCategory: 'listings' | 'profiles' | 'temp',
    toCategory: 'listings' | 'profiles' | 'temp'
  ): Promise<boolean> {
    try {
      const files = await fs.readdir(path.join(this.uploadsDir, fromCategory));
      const targetFile = files.find(file => file.startsWith(fileId));
      
      if (!targetFile) return false;

      const sourcePath = path.join(this.uploadsDir, fromCategory, targetFile);
      const destPath = path.join(this.uploadsDir, toCategory, targetFile);
      
      await fs.rename(sourcePath, destPath);

      const sourceThumbnail = path.join(this.uploadsDir, 'thumbnails', `thumb_${targetFile}`);
      try {
        await fs.access(sourceThumbnail);
        // Thumbnail exists, no need to move it as thumbnails are global
      } catch {
        // No thumbnail to move
      }

      return true;
    } catch {
      return false;
    }
  }

  async getFileInfo(fileId: string, category: 'listings' | 'profiles' | 'temp' = 'temp'): Promise<UploadResult | null> {
    try {
      const files = await fs.readdir(path.join(this.uploadsDir, category));
      const targetFile = files.find(file => file.startsWith(fileId));
      
      if (!targetFile) return null;

      const filePath = path.join(this.uploadsDir, category, targetFile);
      const stats = await fs.stat(filePath);
      const thumbnailPath = path.join(this.uploadsDir, 'thumbnails', `thumb_${targetFile}`);
      
      let thumbnailUrl: string | undefined;
      try {
        await fs.access(thumbnailPath);
        thumbnailUrl = `${this.baseUrl}/uploads/thumbnails/thumb_${targetFile}`;
      } catch {
        // No thumbnail
      }

      return {
        id: fileId,
        filename: targetFile,
        originalName: targetFile,
        mimeType: this.getMimeTypeFromExtension(targetFile),
        size: stats.size,
        path: filePath,
        url: `${this.baseUrl}/uploads/${category}/${targetFile}`,
        thumbnailUrl
      };
    } catch {
      return null;
    }
  }

  async cleanupTempFiles(olderThanHours: number = 24): Promise<number> {
    const tempDir = path.join(this.uploadsDir, 'temp');
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    try {
      const files = await fs.readdir(tempDir);
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      }
      
      return deletedCount;
    } catch {
      return 0;
    }
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private getMimeTypeFromExtension(filename: string): string {
    const ext = this.getFileExtension(filename);
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export const localStorageService = new LocalStorageService();