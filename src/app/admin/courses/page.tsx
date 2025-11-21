"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  price: number;
  is_free: boolean;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  position: number;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterFree, setFilterFree] = useState<string>('all');
  const [filterPublished, setFilterPublished] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    price: 0,
    is_free: true,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration_hours: 0,
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses');

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError('Fout bij het ophalen van cursussen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      setSuccess('Cursus succesvol aangemaakt!');
      setIsDialogOpen(false);
      fetchCourses();

      // Reset form
      setFormData({
        title: '',
        description: '',
        thumbnail_url: '',
        price: 0,
        is_free: true,
        level: 'beginner',
        duration_hours: 0,
      });
    } catch (err) {
      setError('Fout bij het aanmaken van de cursus');
      console.error(err);
    }
  };

  const togglePublished = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setSuccess('Cursus status bijgewerkt!');
      fetchCourses();
    } catch (err) {
      setError('Fout bij het bijwerken van de cursus');
    }
  };

  const deleteCourse = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze cursus wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess('Cursus verwijderd!');
      fetchCourses();
    } catch (err) {
      setError('Fout bij het verwijderen van de cursus');
    }
  };

  const handleSync = async () => {
    setError(null);
    setSuccess(null);
    setSyncing(true);

    try {
      const response = await fetch('/api/admin/courses/sync-from-data', {
        method: 'POST',
        credentials: 'include', // 🔒 Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync courses');
      }

      setSuccess('Standaard cursussen gesynchroniseerd!');
      fetchCourses();
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Fout bij het synchroniseren van cursussen');
    } finally {
      setSyncing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, thumbnail_url: data.url });
      setSuccess('Afbeelding succesvol geüpload!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij het uploaden van de afbeelding');
    } finally {
      setUploadingImage(false);
    }
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    // Search filter
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Level filter
    if (filterLevel !== 'all' && course.level !== filterLevel) {
      return false;
    }

    // Free/Paid filter
    if (filterFree !== 'all') {
      const isFree = filterFree === 'free';
      if (course.is_free !== isFree) {
        return false;
      }
    }

    // Published filter
    if (filterPublished !== 'all') {
      const isPublished = filterPublished === 'published';
      if (course.is_published !== isPublished) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cursus beheer</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = '/admin')}>
            ← Terug naar admin
          </Button>

          <Button variant="secondary" onClick={handleSync} disabled={syncing}>
            {syncing ? 'Synchroniseren…' : 'Synchroniseer standaard cursussen'}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nieuwe cursus
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nieuwe cursus aanmaken</DialogTitle>
                <DialogDescription>
                  Maak een nieuwe cursus aan. Je kunt later modules en lessen toevoegen.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Cursus titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschrijving</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                  <div>
                    <Label className="text-base font-semibold">Cursus thumbnail</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload een afbeelding of plak een URL
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Upload Option */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail-upload" className="text-sm font-medium">
                        📁 Upload afbeelding
                      </Label>
                      <Input
                        id="thumbnail-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="cursor-pointer"
                      />
                      {uploadingImage && (
                        <p className="text-xs text-muted-foreground">Uploaden...</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Max 10MB • JPEG, PNG, WebP, GIF
                      </p>
                    </div>

                    {/* URL Option */}
                    <div className="space-y-2">
                      <Label htmlFor="thumbnail_url" className="text-sm font-medium">
                        🔗 Of plak afbeelding URL
                      </Label>
                      <Input
                        id="thumbnail_url"
                        type="text"
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        placeholder="https://..."
                        disabled={uploadingImage}
                      />
                    </div>
                  </div>

                  {formData.thumbnail_url && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-green-800">✓ Thumbnail ingesteld:</p>
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-full h-40 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Niveau</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value: any) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Gemiddeld</SelectItem>
                        <SelectItem value="advanced">Gevorderd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration_hours">Duur (uren)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      min="0"
                      value={formData.duration_hours}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                  />
                  <Label htmlFor="is_free">Gratis cursus</Label>
                </div>

                {!formData.is_free && (
                  <div>
                    <Label htmlFor="price">Prijs (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button type="submit">Cursus Aanmaken</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Alle Cursussen</CardTitle>

          {/* Filters */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="🔍 Zoek op titel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle niveaus</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Gemiddeld</SelectItem>
                  <SelectItem value="advanced">Gevorderd</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterFree} onValueChange={setFilterFree}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle types</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="paid">Betaald</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <Select value={filterPublished} onValueChange={setFilterPublished}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="published">Gepubliceerd</SelectItem>
                  <SelectItem value="draft">Niet gepubliceerd</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {filteredCourses.length} van {courses.length} cursussen
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Laden...</p>
          ) : filteredCourses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Geen cursussen gevonden met deze filters.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Gratis Cursussen */}
              {(() => {
                const freeCourses = filteredCourses.filter(c => c.is_free).sort((a, b) => a.position - b.position);
                if (freeCourses.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">1. Gratis Cursussen</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titel</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Duur</TableHead>
                          <TableHead>Gepubliceerd</TableHead>
                          <TableHead className="text-right">Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {freeCourses.map((course, index) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">1.{index + 1} {course.title}</TableCell>
                            <TableCell className="capitalize">{course.level}</TableCell>
                            <TableCell>{course.duration_hours}u</TableCell>
                            <TableCell>
                              <Switch
                                checked={course.is_published}
                                onCheckedChange={() => togglePublished(course.id, course.is_published)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/courses/${course.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteCourse(course.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}

              {/* Betaalde Cursussen */}
              {(() => {
                const paidCourses = filteredCourses.filter(c => !c.is_free).sort((a, b) => a.position - b.position);
                if (paidCourses.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">2. Betaalde Cursussen</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titel</TableHead>
                          <TableHead>Niveau</TableHead>
                          <TableHead>Duur</TableHead>
                          <TableHead>Prijs</TableHead>
                          <TableHead>Gepubliceerd</TableHead>
                          <TableHead className="text-right">Acties</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paidCourses.map((course, index) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">2.{index + 1} {course.title}</TableCell>
                            <TableCell className="capitalize">{course.level}</TableCell>
                            <TableCell>{course.duration_hours}u</TableCell>
                            <TableCell>€{course.price}</TableCell>
                            <TableCell>
                              <Switch
                                checked={course.is_published}
                                onCheckedChange={() => togglePublished(course.id, course.is_published)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/admin/courses/${course.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteCourse(course.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
