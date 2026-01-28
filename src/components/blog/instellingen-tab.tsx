"use client";

/**
 * INSTELLINGEN TAB - Blog Editor
 *
 * Settings tab for blog posts:
 * - Category selection
 * - Tags input (comma-separated)
 * - Header type: Image OR Color background
 * - Color picker for background
 * - Header title overlay
 * - Preview
 *
 * DatingAssistent styling with pink gradients
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Palette, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BLOG_CATEGORIES, type CreateBlogPostData } from '@/types/blog';
import { cn } from '@/lib/utils';

interface InstellingenTabProps {
  blogData: Partial<CreateBlogPostData>;
  updateBlogData: (updates: Partial<CreateBlogPostData>) => void;
}

export function InstellingenTab({ blogData, updateBlogData }: InstellingenTabProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // =========================================================================
  // IMAGE UPLOAD
  // =========================================================================

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ongeldig bestand',
        description: 'Alleen afbeeldingen zijn toegestaan',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Bestand te groot',
        description: 'Maximum bestandsgrootte is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload mislukt');

      const data = await response.json();

      updateBlogData({
        header_type: 'image',
        cover_image_url: data.image.url,
        cover_image_blob_id: data.image.blobId,
      });

      toast({
        title: 'Succesvol!',
        description: 'Afbeelding is geüpload',
      });
    } catch (error) {
      toast({
        title: 'Upload mislukt',
        description: error instanceof Error ? error.message : 'Probeer opnieuw',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // =========================================================================
  // TAGS HANDLING
  // =========================================================================

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    updateBlogData({ tags });
  };

  // =========================================================================
  // COLOR PRESETS
  // =========================================================================

  const colorPresets = [
    { name: 'Warm Coral', value: '#FF7B54', gradient: 'from-orange-400 to-orange-600' },
    { name: 'Licht Coral', value: '#FFB49D', gradient: 'from-orange-300 to-orange-500' },
    { name: 'Blauw', value: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
    { name: 'Groen', value: '#10b981', gradient: 'from-emerald-400 to-emerald-600' },
  ];

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="space-y-6">
      {/* Artikel Instellingen Card */}
      <Card className="border-coral-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Artikel Instellingen
          </CardTitle>
          <p className="text-sm text-gray-500">
            Categorisatie en publicatie instellingen
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium flex items-center">
              Categorie
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={blogData.category || 'Online Dating Tips'}
              onValueChange={(value) => updateBlogData({ category: value })}
            >
              <SelectTrigger className="w-full md:w-1/2 border-gray-300 focus:ring-coral-500">
                <SelectValue placeholder="Selecteer categorie" />
              </SelectTrigger>
              <SelectContent>
                {BLOG_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags
            </Label>
            <Input
              id="tags"
              placeholder="LEGO Serious Play, Teams, Facilitatie, Creativiteit"
              value={blogData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              className="border-gray-300 focus:ring-coral-500"
            />
            <p className="text-xs text-gray-500">Komma-gescheiden</p>
          </div>

          {/* Publicatiedatum */}
          <div className="space-y-2">
            <Label htmlFor="publish_date" className="text-sm font-medium">
              Publicatiedatum
            </Label>
            <Input
              id="publish_date"
              type="datetime-local"
              value={
                blogData.published_at
                  ? new Date(blogData.published_at).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                updateBlogData({ published_at: dateValue });
              }}
              className="border-gray-300 focus:ring-coral-500 w-full md:w-1/2"
            />
            <p className="text-xs text-gray-500">
              Laat leeg voor huidige datum/tijd bij publiceren
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Header Afbeelding Card */}
      <Card className="border-coral-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Header Afbeelding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Type Selection */}
          <div className="flex gap-4">
            {/* Image Upload Button */}
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button
                type="button"
                variant={blogData.header_type === 'image' ? 'default' : 'outline'}
                className={cn(
                  'w-full h-12',
                  blogData.header_type === 'image'
                    ? 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200'
                    : 'border-gray-300 hover:bg-gray-50'
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.parentElement?.querySelector('input[type=file]');
                  input?.click();
                }}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploaden...' : 'Afbeelding'}
              </Button>
            </label>

            {/* Color + Title Button */}
            <Button
              type="button"
              variant={blogData.header_type === 'color' ? 'default' : 'outline'}
              className={cn(
                'flex-1 h-12',
                blogData.header_type === 'color'
                  ? 'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:from-coral-600 hover:to-coral-700'
                  : 'border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => updateBlogData({ header_type: 'color' })}
            >
              <Palette className="w-4 h-4 mr-2" />
              Kleur + Titel
            </Button>
          </div>

          {/* Show color options if color header is selected */}
          {blogData.header_type === 'color' && (
            <>
              {/* Background Color Picker */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Achtergrondkleur</Label>
                <div className="grid grid-cols-2 gap-4">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => updateBlogData({ header_color: preset.value })}
                      className={cn(
                        'relative h-20 rounded-lg border-2 transition-all overflow-hidden',
                        blogData.header_color === preset.value
                          ? 'border-coral-500 ring-4 ring-coral-200'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn('absolute inset-0 bg-gradient-to-r', preset.gradient)} />
                      <div className="relative h-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg drop-shadow-lg">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Title Overlay */}
              <div className="space-y-2">
                <Label htmlFor="header_title" className="text-sm font-medium">
                  Header Titel
                </Label>
                <Input
                  id="header_title"
                  placeholder="Eigen titel voor de header..."
                  value={blogData.header_title || ''}
                  onChange={(e) => updateBlogData({ header_title: e.target.value })}
                  className="border-gray-300 focus:ring-coral-500"
                />
                <p className="text-xs text-gray-500">
                  Laat leeg om de artikel titel te gebruiken
                </p>
              </div>
            </>
          )}

          {/* Show image preview if image header is selected */}
          {blogData.header_type === 'image' && blogData.cover_image_url && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Huidige afbeelding</Label>
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={blogData.cover_image_url}
                  alt="Header preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-coral-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Eye className="w-5 h-5 mr-2 text-coral-500" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header Preview */}
            <div className="relative aspect-[21/9] rounded-lg overflow-hidden border-2 border-gray-200">
              {blogData.header_type === 'color' ? (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${blogData.header_color || '#FF7B54'}, ${adjustColor(blogData.header_color || '#FF7B54', -20)})`,
                  }}
                >
                  <h1 className="text-4xl font-bold text-white drop-shadow-2xl px-8 text-center">
                    {blogData.header_title || blogData.title || 'Blog Titel'}
                  </h1>
                </div>
              ) : blogData.cover_image_url ? (
                <img
                  src={blogData.cover_image_url}
                  alt="Header preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <p className="text-gray-400">Geen header afbeelding</p>
                </div>
              )}
            </div>

            {/* Metadata Preview */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-coral-100 text-coral-700 text-xs font-medium rounded">
                  {blogData.category || 'Categorie'}
                </span>
                {blogData.tags && blogData.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {blogData.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-coral-100 text-coral-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {blogData.title || 'Blog Titel'}
              </h2>
              <p className="text-sm text-gray-600">
                {blogData.excerpt || 'Excerpt wordt hier weergegeven...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Helper function to darken/lighten a hex color
 */
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
