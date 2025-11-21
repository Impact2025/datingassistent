"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Check,
  X,
} from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      drawImage(img, rotation, scale, brightness, contrast, saturation);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const drawImage = (
    img: HTMLImageElement,
    rot: number,
    scl: number,
    brg: number,
    cnt: number,
    sat: number
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image aspect ratio but max 800px width
    const maxWidth = 800;
    const aspectRatio = img.height / img.width;
    canvas.width = Math.min(img.width, maxWidth);
    canvas.height = canvas.width * aspectRatio;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rot * Math.PI) / 180);

    // Apply scale
    const scaleFactor = scl / 100;

    // Apply filters
    ctx.filter = `brightness(${brg}%) contrast(${cnt}%) saturate(${sat}%)`;

    // Draw image
    ctx.drawImage(
      img,
      (-canvas.width / 2) * scaleFactor,
      (-canvas.height / 2) * scaleFactor,
      canvas.width * scaleFactor,
      canvas.height * scaleFactor
    );

    // Restore context
    ctx.restore();
  };

  useEffect(() => {
    if (image) {
      drawImage(image, rotation, scale, brightness, contrast, saturation);
    }
  }, [rotation, scale, brightness, contrast, saturation, image]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 10, 50));
  };

  const handleReset = () => {
    setRotation(0);
    setScale(100);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        onSave(url);
      },
      'image/jpeg',
      0.9
    );
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Afbeelding bewerken</Label>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[400px]">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[600px]"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Snelle acties</Label>
          <div className="flex gap-2">
            <Button onClick={handleRotate} variant="outline" size="sm" className="flex-1">
              <RotateCw className="w-4 h-4 mr-2" />
              Roteren
            </Button>
            <Button onClick={handleZoomIn} variant="outline" size="sm" className="flex-1">
              <ZoomIn className="w-4 h-4 mr-2" />
              Zoom +
            </Button>
            <Button onClick={handleZoomOut} variant="outline" size="sm" className="flex-1">
              <ZoomOut className="w-4 h-4 mr-2" />
              Zoom -
            </Button>
          </div>
        </div>

        {/* Scale */}
        <div className="space-y-2">
          <Label className="text-sm">Zoom: {scale}%</Label>
          <Slider
            value={[scale]}
            onValueChange={(value) => setScale(value[0])}
            min={50}
            max={200}
            step={5}
          />
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <Label className="text-sm">Helderheid: {brightness}%</Label>
          <Slider
            value={[brightness]}
            onValueChange={(value) => setBrightness(value[0])}
            min={50}
            max={150}
            step={5}
          />
        </div>

        {/* Contrast */}
        <div className="space-y-2">
          <Label className="text-sm">Contrast: {contrast}%</Label>
          <Slider
            value={[contrast]}
            onValueChange={(value) => setContrast(value[0])}
            min={50}
            max={150}
            step={5}
          />
        </div>

        {/* Saturation */}
        <div className="space-y-2">
          <Label className="text-sm">Verzadiging: {saturation}%</Label>
          <Slider
            value={[saturation]}
            onValueChange={(value) => setSaturation(value[0])}
            min={0}
            max={200}
            step={5}
          />
        </div>
      </div>

      {/* Save/Cancel */}
      <div className="flex gap-4 pt-4 border-t">
        <Button onClick={handleSave} className="flex-1" size="lg">
          <Check className="w-4 h-4 mr-2" />
          Opslaan
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1" size="lg">
          <X className="w-4 h-4 mr-2" />
          Annuleren
        </Button>
      </div>
    </Card>
  );
}
