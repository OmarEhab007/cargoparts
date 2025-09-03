'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
}

interface FileUploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  onDelete?: (fileId: string) => void;
  category?: 'listings' | 'profiles' | 'temp';
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  className?: string;
}

export function FileUpload({
  onUpload,
  onDelete,
  category = 'temp',
  multiple = false,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;

    const filesToUpload = Array.from(selectedFiles);
    
    if (files.length + filesToUpload.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const uploadedFiles: UploadedFile[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds maximum size of ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        continue;
      }

      if (!acceptedFileTypes.includes(file.type)) {
        alert(`File type ${file.type} not supported`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('options', JSON.stringify({
          category,
          maxFileSize,
          generateThumbnail: true
        }));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const uploadedFile = await response.json();
        uploadedFiles.push(uploadedFile);
        
        setUploadProgress(((i + 1) / filesToUpload.length) * 100);
        
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    setUploading(false);
    setUploadProgress(0);
    
    onUpload?.(newFiles);
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?fileId=${fileId}&category=${category}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newFiles = files.filter(file => file.id !== fileId);
        setFiles(newFiles);
        onDelete?.(fileId);
        onUpload?.(newFiles);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer',
          dragOver && 'border-blue-500 bg-blue-50',
          'p-6 text-center'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">
              اسحب الملفات هنا أو اضغط للاختيار
            </p>
            <p className="text-sm text-gray-500">
              Drop files here or click to select
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Max {maxFiles} files, {Math.round(maxFileSize / 1024 / 1024)}MB each
          </p>
        </div>
      </Card>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>جاري الرفع... Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="relative overflow-hidden">
              <div className="aspect-square relative">
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-2">
                <p className="text-xs truncate" title={file.originalName}>
                  {file.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(file.size / 1024)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}