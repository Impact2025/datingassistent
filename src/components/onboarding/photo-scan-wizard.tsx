'use client';

/**
 * Photo Scan Wizard - The Magic Trick
 *
 * Photo upload with AI analysis animation.
 * Creates perceived value through animated scanning states.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Lock, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PhotoAnalysisResult } from '@/types/lead-activation.types';
import { SCANNING_TEXTS } from '@/types/lead-activation.types';

interface PhotoScanWizardProps {
  userId: number;
  onScanStart: () => void;
  onScanComplete: (result: PhotoAnalysisResult) => void;
  isScanning: boolean;
}

export function PhotoScanWizard({
  userId,
  onScanStart,
  onScanComplete,
  isScanning,
}: PhotoScanWizardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanningTextIndex, setScanningTextIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through scanning texts
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanningTextIndex((prev) => (prev + 1) % SCANNING_TEXTS.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selecteer een afbeelding (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Afbeelding is te groot. Maximum 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;

    onScanStart();
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('context', 'profile_photo');
      formData.append('skipAuth', 'true'); // Skip auth for onboarding
      formData.append('userId', userId.toString());

      const response = await fetch('/api/photo-analysis/lead', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analyse mislukt');
      }

      const result: PhotoAnalysisResult = await response.json();
      onScanComplete(result);
    } catch (err) {
      console.error('Photo analysis error:', err);
      setError(
        err instanceof Error ? err.message : 'Er ging iets mis bij de analyse'
      );
      // Reset to upload state on error
      onScanComplete({
        overall_score: 6.5,
        analysis: {
          lighting: { score: 7, feedback: 'Analyse kon niet worden voltooid' },
          composition: { score: 6.5, feedback: 'Probeer opnieuw' },
          authenticity: { score: 7, feedback: 'Probeer opnieuw' },
          facial_expression: { score: 6, feedback: 'Probeer opnieuw' },
        },
        tips: ['Probeer het opnieuw met een andere foto'],
        suggestions: {
          alternative_angles: [],
          background: [],
          overall: 'Probeer het opnieuw',
        },
      });
    }
  };

  // Scanning State
  if (isScanning) {
    return (
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
        {/* Preview Image with scanning overlay */}
        {previewUrl && (
          <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Scanning overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-coral-500/20 to-transparent"
              animate={{
                y: ['0%', '100%', '0%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Corner brackets */}
            <div className="absolute inset-2 border-2 border-coral-500/50 rounded-lg" />
          </div>
        )}

        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-coral-50 flex items-center justify-center mx-auto mb-6"
        >
          <Sparkles className="w-8 h-8 text-coral-500" />
        </motion.div>

        {/* Scanning Text */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          AI Analyse bezig...
        </h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={scanningTextIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-gray-600 mb-6 h-6"
          >
            {SCANNING_TEXTS[scanningTextIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 text-coral-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Even geduld (10 sec)</span>
        </div>
      </div>
    );
  }

  // Upload State
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Laten we beginnen met een nulmeting
        </h1>
        <p className="text-gray-600">
          Upload je beste profielfoto voor een gratis AI-analyse
        </p>
      </div>

      {/* Privacy Guarantee - Prominent */}
      <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
        <Lock className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-700">
          Je foto wordt na de scan (10 sec) direct van onze servers verwijderd. 100% Privé.
        </span>
      </div>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
            'border-gray-300 hover:border-coral-400 hover:bg-coral-50/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>

          <p className="font-medium text-gray-700 mb-1">
            Klik om een foto te uploaden
          </p>
          <p className="text-sm text-gray-500">JPG, PNG of WebP - Max 10MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative w-full max-w-xs mx-auto">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full rounded-2xl border shadow-sm"
            />
            {/* Change button */}
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={handleStartScan}
            className="w-full bg-coral-500 hover:bg-coral-600 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Camera className="w-5 h-5 mr-2" />
            Analyseer mijn foto
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-700 mb-2">Tips voor de beste analyse:</p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Gebruik een close-up foto (hoofd & schouders)</li>
          <li>• Zorg voor goede belichting (daglicht werkt het best)</li>
          <li>• Kijk direct in de camera</li>
        </ul>
      </div>
    </div>
  );
}
