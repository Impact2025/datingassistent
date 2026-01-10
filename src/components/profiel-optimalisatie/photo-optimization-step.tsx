"use client";

/**
 * Photo Optimization Step - Upload, Analyze, Optimize
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, Camera, CheckCircle, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface PhotoOptimizationStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  existingPhotoCount?: number;
}

export function PhotoOptimizationStep({ onComplete, onBack, existingPhotoCount }: PhotoOptimizationStepProps) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          url: e.target?.result as string,
          score: Math.floor(Math.random() * 3) + 7, // Simulate AI score 7-10
          analysis: {
            quality: 'Goed',
            smile: true,
            lighting: 'Perfect',
            context: 'Outdoor'
          }
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const canContinue = photos.length >= 3;

  // Extract only metadata for storage (not base64 images)
  const getPhotoMetadata = () => {
    return photos.map(photo => ({
      score: photo.score,
      analysis: photo.analysis
    }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Terug naar Route</span>
          </button>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              📸 Foto Strategie
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Upload 3-6 foto's voor AI analyse en optimalisatie
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <Card
          className={`p-12 border-2 border-dashed transition-colors dark:bg-gray-800 ${
            isDragging ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Sleep foto's hierheen of klik om te uploaden
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG tot 10MB • Minimaal 3 foto's, ideaal 6
              </p>
            </div>
            <Button
              onClick={() => document.getElementById('photo-upload')?.click()}
              variant="outline"
              className="border-2 border-gray-900 dark:border-gray-100 dark:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
            >
              <Camera className="w-4 h-4 mr-2" />
              Selecteer Foto's
            </Button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>
        </Card>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Jouw Foto's ({photos.length}/6)
              </h3>
              {canContinue && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Minimaal aantal bereikt</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-md group relative dark:bg-gray-800">
                  <div className="aspect-square relative">
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Foto {index + 1}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{photo.score}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">/10</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {photo.analysis.smile && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                          ✓ Lach
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                        {photo.analysis.lighting}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        {canContinue && (
          <div className="pt-4">
            <Button
              onClick={() => onComplete({
                photoCount: photos.length,
                photoMetadata: getPhotoMetadata(),
                photoScore: 8.5
              })}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium group"
              size="lg"
            >
              Foto's Opslaan & Verder
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {!canContinue && photos.length > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Upload nog {3 - photos.length} foto{3 - photos.length !== 1 ? "'s" : ''} om door te gaan
          </div>
        )}
      </div>
    </div>
  );
}
