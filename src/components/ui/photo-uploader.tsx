"use client";

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  maxFiles?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
}

export function PhotoUploader({
  maxFiles = 3,
  value = [],
  onChange,
  className
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<string[]>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files).slice(0, maxFiles - photos.length);

    setUploading(true);

    try {
      const newPhotoUrls: string[] = [];

      for (const file of fileArray) {
        // Convert to base64 for preview/upload
        const reader = new FileReader();
        const result = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newPhotoUrls.push(result);
      }

      const updated = [...photos, ...newPhotoUrls];
      setPhotos(updated);
      onChange?.(updated);
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
    }
  }, [photos, maxFiles, onChange]);

  const removePhoto = useCallback((index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onChange?.(updated);
  }, [photos, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {photos.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 transition-all",
            isDragging
              ? "border-coral-400 bg-coral-50 scale-[1.02]"
              : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-coral-100" : "bg-gray-100"
            )}>
              {uploading ? (
                <div className="w-6 h-6 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className={cn(
                  "w-6 h-6",
                  isDragging ? "text-coral-600" : "text-gray-400"
                )} />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Sleep foto's hierheen of{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-coral-600 hover:text-coral-700 underline underline-offset-2"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Maximaal {maxFiles} foto's • JPG, PNG
              </p>
            </div>

            {/* Mobile: Direct camera access */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'environment';
                input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
                input.click();
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Maak Foto
            </Button>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              <img
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>

              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2 py-1 bg-white/90 rounded text-xs font-medium text-gray-700">
                  Foto {index + 1}
                </div>
              </div>
            </div>
          ))}

          {/* Add More Button */}
          {photos.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-coral-300 hover:bg-coral-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-coral-600"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Voeg toe</span>
            </button>
          )}
        </div>
      )}

      {/* Photo Count */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {photos.length} van {maxFiles} foto's toegevoegd
          </span>
          {photos.length === maxFiles && (
            <span className="text-green-600 font-medium">Compleet</span>
          )}
        </div>
      )}
    </div>
  );
}
