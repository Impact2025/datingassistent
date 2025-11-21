"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export interface Slide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  notes?: string;
}

export interface SlidesData {
  title: string;
  description: string;
  slides: Slide[];
}

interface SlidesEditorProps {
  value: SlidesData;
  onChange: (value: SlidesData) => void;
}

export function SlidesEditor({ value, onChange }: SlidesEditorProps) {
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [slideForm, setSlideForm] = useState<Slide>({
    id: '',
    title: '',
    content: '',
    imageUrl: '',
    notes: '',
  });

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide${Date.now()}`,
      title: '',
      content: '',
      imageUrl: '',
      notes: '',
    };
    setSlideForm(newSlide);
    setEditingSlideId(newSlide.id);
  };

  const handleEditSlide = (slide: Slide) => {
    setSlideForm({ ...slide });
    setEditingSlideId(slide.id);
  };

  const handleSaveSlide = () => {
    if (!slideForm.title.trim()) {
      alert('Voer een titel in voor deze slide');
      return;
    }

    const existingIndex = value.slides.findIndex(s => s.id === slideForm.id);
    let updatedSlides;

    if (existingIndex >= 0) {
      // Update existing slide
      updatedSlides = [...value.slides];
      updatedSlides[existingIndex] = slideForm;
    } else {
      // Add new slide
      updatedSlides = [...value.slides, slideForm];
    }

    onChange({ ...value, slides: updatedSlides });
    setEditingSlideId(null);
    setSlideForm({
      id: '',
      title: '',
      content: '',
      imageUrl: '',
      notes: '',
    });
  };

  const handleCancelEdit = () => {
    setEditingSlideId(null);
    setSlideForm({
      id: '',
      title: '',
      content: '',
      imageUrl: '',
      notes: '',
    });
  };

  const handleDeleteSlide = (id: string) => {
    if (!confirm('Weet je zeker dat je deze slide wilt verwijderen?')) return;
    onChange({
      ...value,
      slides: value.slides.filter(s => s.id !== id),
    });
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...value.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    onChange({ ...value, slides: newSlides });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setSlideForm({ ...slideForm, imageUrl: data.url });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fout bij het uploaden van de afbeelding');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slides Header */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="slides-title">Presentatie Titel</Label>
          <Input
            id="slides-title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="Bijv: Introductie tot Online Dating Veiligheid"
          />
        </div>
        <div>
          <Label htmlFor="slides-description">Presentatie Beschrijving</Label>
          <Textarea
            id="slides-description"
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder="Beschrijf waar deze presentatie over gaat..."
            rows={3}
          />
        </div>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Slides ({value.slides.length})
          </h3>
          <Button type="button" onClick={handleAddSlide} size="sm" disabled={editingSlideId !== null}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Slide
          </Button>
        </div>

        {value.slides.length === 0 && editingSlideId === null && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nog geen slides. Klik op "Nieuwe Slide" om te beginnen.
          </p>
        )}

        {/* Slide Editor Form */}
        {editingSlideId && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">
                {value.slides.find(s => s.id === editingSlideId) ? 'Slide Bewerken' : 'Nieuwe Slide'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="slide-title">Slide Titel *</Label>
                <Input
                  id="slide-title"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="Titel van deze slide"
                />
              </div>

              <div>
                <Label htmlFor="slide-content">Slide Inhoud</Label>
                <RichTextEditor
                  content={slideForm.content}
                  onChange={(content) => setSlideForm({ ...slideForm, content })}
                  placeholder="Inhoud van deze slide..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gebruik de toolbar voor opmaak, lijsten en links.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slide-image">
                  <ImageIcon className="inline h-4 w-4 mr-1" />
                  Slide Afbeelding (Optioneel)
                </Label>
                <Input
                  id="slide-image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="cursor-pointer"
                />
                {uploadingImage && (
                  <p className="text-xs text-muted-foreground">Uploaden...</p>
                )}
                {slideForm.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={slideForm.imageUrl}
                      alt="Slide preview"
                      className="w-full h-48 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSlideForm({ ...slideForm, imageUrl: '' })}
                      className="mt-1 text-xs"
                    >
                      Verwijderen
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 10MB • JPG, PNG, WebP, GIF
                </p>
              </div>

              <div>
                <Label htmlFor="slide-notes">Notities (Optioneel)</Label>
                <Textarea
                  id="slide-notes"
                  value={slideForm.notes}
                  onChange={(e) => setSlideForm({ ...slideForm, notes: e.target.value })}
                  placeholder="Extra notities of uitleg voor deze slide..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuleren
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveSlide}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Opslaan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Slides */}
        {value.slides.map((slide, index) => (
          <Card key={slide.id} className={editingSlideId === slide.id ? 'hidden' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold">{slide.title}</h4>
                  </div>

                  {slide.imageUrl && (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-32 h-24 object-cover rounded border mb-2"
                    />
                  )}

                  {slide.content && (
                    <div
                      className="text-sm text-muted-foreground prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: slide.content.substring(0, 150) + (slide.content.length > 150 ? '...' : '') }}
                    />
                  )}

                  {slide.notes && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Notities: {slide.notes.substring(0, 100)}{slide.notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0 || editingSlideId !== null}
                    title="Verplaats omhoog"
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === value.slides.length - 1 || editingSlideId !== null}
                    title="Verplaats omlaag"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditSlide(slide)}
                    disabled={editingSlideId !== null}
                    title="Bewerk slide"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSlide(slide.id)}
                    disabled={editingSlideId !== null}
                    title="Verwijder slide"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
