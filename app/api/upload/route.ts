import { NextRequest, NextResponse } from 'next/server';
import { localStorageService } from '@/lib/storage/local-storage';
import { z } from 'zod';

const uploadSchema = z.object({
  category: z.enum(['listings', 'profiles', 'temp']).optional().default('temp'),
  maxFileSize: z.number().optional(),
  generateThumbnail: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const options = formData.get('options') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    let parsedOptions = {};
    if (options) {
      try {
        parsedOptions = uploadSchema.parse(JSON.parse(options));
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid options format' },
          { status: 400 }
        );
      }
    }

    const result = await localStorageService.uploadFile(
      file,
      (parsedOptions as any).category || 'temp',
      parsedOptions
    );

    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const category = searchParams.get('category') as 'listings' | 'profiles' | 'temp' || 'temp';
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      );
    }

    const success = await localStorageService.deleteFile(fileId, category);
    
    if (success) {
      return NextResponse.json({ message: 'File deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}