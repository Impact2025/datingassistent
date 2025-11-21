"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizEditor, type QuizData } from '@/components/admin/quiz-editor';
import { SlidesEditor, type SlidesData } from '@/components/admin/slides-editor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertCircle, CheckCircle, Plus, Edit, Trash2, Video, FileText, Headphones, ChevronUp, ChevronDown } from 'lucide-react';

type LessonType = 'video' | 'audio' | 'text' | 'quiz' | 'assignment' | 'slides';

interface Lesson {
  id: number;
  module_id: number;
  title: string;
  description: string | null;
  content: string | null;
  lesson_type: LessonType;
  image_url: string | null;
  video_url: string | null;
  video_duration: number | null;
  is_preview: boolean;
  position: number;
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  position: number;
  lessons: Lesson[];
}

interface CourseData {
  id: number;
  title: string;
  description: string | null;
  is_free: boolean;
  position: number;
  modules: Module[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [allCourses, setAllCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [currentLessonNumber, setCurrentLessonNumber] = useState<string>('');

  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    image_url: '',
    video_url: '',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    lesson_type: 'video' as LessonType,
    image_url: '',
    video_url: '',
    video_duration: 0,
    is_preview: false,
  });

  // Parse quiz data from content when editing quiz lessons
  const getQuizData = (): QuizData => {
    if (lessonForm.lesson_type === 'quiz' && lessonForm.content) {
      try {
        return JSON.parse(lessonForm.content);
      } catch (e) {
        // Return empty quiz if parsing fails
        return { title: '', description: '', questions: [] };
      }
    }
    return { title: '', description: '', questions: [] };
  };

  const handleQuizDataChange = (quizData: QuizData) => {
    setLessonForm({ ...lessonForm, content: JSON.stringify(quizData) });
  };

  // Parse slides data from content when editing slides lessons
  const getSlidesData = (): SlidesData => {
    if (lessonForm.lesson_type === 'slides' && lessonForm.content) {
      try {
        return JSON.parse(lessonForm.content);
      } catch (e) {
        // Return empty slides if parsing fails
        return { title: '', description: '', slides: [] };
      }
    }
    return { title: '', description: '', slides: [] };
  };

  const handleSlidesDataChange = (slidesData: SlidesData) => {
    setLessonForm({ ...lessonForm, content: JSON.stringify(slidesData) });
  };

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingModuleImage, setUploadingModuleImage] = useState(false);
  const [uploadingModuleVideo, setUploadingModuleVideo] = useState(false);
  const [uploadingLessonImage, setUploadingLessonImage] = useState(false);

  useEffect(() => {
    fetchAllCourses();
    fetchCourseData();
  }, [courseId]);

  const fetchAllCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      setAllCourses(data);
    } catch (err) {
      console.error('Error fetching all courses:', err);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`);

      if (!response.ok) throw new Error('Failed to fetch course');

      const data = await response.json();
      setCourseData(data);
    } catch (err) {
      setError('Fout bij het ophalen van cursus data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate hierarchical course number (1.1, 1.2, 2.1, 2.2, etc.)
  const getCourseNumber = () => {
    if (!courseData) return '';
    const category = courseData.is_free ? 1 : 2;
    const categoryIndex = allCourses
      .filter(c => c.is_free === courseData.is_free)
      .sort((a, b) => a.position - b.position)
      .findIndex(c => c.id === courseData.id) + 1;
    return `${category}.${categoryIndex}`;
  };

  const [currentModuleNumber, setCurrentModuleNumber] = useState<number>(0);

  const handleEditModule = async (module: Module, moduleNumber: number) => {
    // First refresh the data to ensure we have the latest
    await fetchCourseData();

    // Find the module again from the refreshed data
    const refreshedModule = courseData?.modules.find(m => m.id === module.id);
    const moduleToEdit = refreshedModule || module;

    setEditingModuleId(moduleToEdit.id);
    setCurrentModuleNumber(moduleNumber);
    setModuleForm({
      title: moduleToEdit.title,
      description: moduleToEdit.description || '',
      image_url: moduleToEdit.image_url || '',
      video_url: moduleToEdit.video_url || '',
    });
    setSuccess(null); // Clear any previous success messages
    setError(null); // Clear any previous error messages
    setIsModuleDialogOpen(true);
  };

  const handleEditLesson = (lesson: Lesson, lessonNumber: string) => {
    setEditingLessonId(lesson.id);
    setSelectedModuleId(lesson.module_id);
    setCurrentLessonNumber(lessonNumber);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      lesson_type: lesson.lesson_type,
      image_url: lesson.image_url || '',
      video_url: lesson.video_url || '',
      video_duration: lesson.video_duration || 0,
      is_preview: lesson.is_preview,
    });
    setSuccess(null); // Clear any previous success messages
    setError(null); // Clear any previous error messages
    setIsLessonDialogOpen(true);
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingModuleId) {
        // Update existing module
        const response = await fetch('/api/admin/modules', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingModuleId,
            ...moduleForm,
          }),
        });

        if (!response.ok) throw new Error('Failed to update module');
        setSuccess('Module succesvol bijgewerkt!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Create new module
        const response = await fetch('/api/admin/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: courseId,
            ...moduleForm,
          }),
        });

        if (!response.ok) throw new Error('Failed to create module');
        setSuccess('Module succesvol aangemaakt!');
        setTimeout(() => setSuccess(null), 3000);
      }

      setIsModuleDialogOpen(false);
      setEditingModuleId(null);
      setModuleForm({ title: '', description: '', image_url: '', video_url: '' });
      fetchCourseData();
    } catch (err) {
      setError(editingModuleId ? 'Fout bij het bijwerken van de module' : 'Fout bij het aanmaken van de module');
    }
  };

  const handleModuleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingModuleImage(true);
    setError(null);

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
      setModuleForm({ ...moduleForm, image_url: data.url });
      setSuccess('Afbeelding succesvol geüpload!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij het uploaden van de afbeelding');
    } finally {
      setUploadingModuleImage(false);
    }
  };

  const handleModuleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingModuleVideo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setModuleForm({ ...moduleForm, video_url: data.url });
      setSuccess('Video succesvol geüpload!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij het uploaden van de video');
    } finally {
      setUploadingModuleVideo(false);
    }
  };

  const handleLessonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLessonImage(true);
    setError(null);

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
      setLessonForm({ ...lessonForm, image_url: data.url });
      setSuccess('Afbeelding succesvol geüpload!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij het uploaden van de afbeelding');
    } finally {
      setUploadingLessonImage(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update lesson form with uploaded video URL
      setLessonForm({
        ...lessonForm,
        video_url: data.url,
      });

      setSuccess('Video succesvol geüpload!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fout bij het uploaden van de video');
    } finally {
      setUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModuleId) return;

    try {
      if (editingLessonId) {
        // Update existing lesson
        const response = await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingLessonId,
            ...lessonForm,
          }),
        });

        if (!response.ok) throw new Error('Failed to update lesson');
        setSuccess('Les succesvol bijgewerkt!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Create new lesson
        const response = await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_id: selectedModuleId,
            ...lessonForm,
          }),
        });

        if (!response.ok) throw new Error('Failed to create lesson');
        setSuccess('Les succesvol aangemaakt!');
        setTimeout(() => setSuccess(null), 3000);
      }

      setIsLessonDialogOpen(false);
      setEditingLessonId(null);
      setLessonForm({
        title: '',
        description: '',
        content: '',
        lesson_type: 'video',
        image_url: '',
        video_url: '',
        video_duration: 0,
        is_preview: false,
      });
      fetchCourseData();
    } catch (err) {
      setError(editingLessonId ? 'Fout bij het bijwerken van de les' : 'Fout bij het aanmaken van de les');
    }
  };

  const deleteModule = async (moduleId: number) => {
    if (!confirm('Weet je zeker dat je deze module wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess('Module verwijderd!');
      fetchCourseData();
    } catch (err) {
      setError('Fout bij het verwijderen van de module');
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!confirm('Weet je zeker dat je deze les wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setSuccess('Les verwijderd!');
      fetchCourseData();
    } catch (err) {
      setError('Fout bij het verwijderen van de les');
    }
  };

  const moveLessonUp = async (moduleId: number, lessonIndex: number) => {
    if (lessonIndex === 0) return; // Already at top

    const module = courseData?.modules.find(m => m.id === moduleId);
    if (!module) return;

    const lessons = [...module.lessons];
    const lesson = lessons[lessonIndex];
    const prevLesson = lessons[lessonIndex - 1];

    // Swap positions
    const tempPosition = lesson.position;
    lesson.position = prevLesson.position;
    prevLesson.position = tempPosition;

    try {
      // Update both lessons
      await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lesson.id,
          position: lesson.position,
        }),
      });

      await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prevLesson.id,
          position: prevLesson.position,
        }),
      });

      setSuccess('Les verplaatst!');
      fetchCourseData();
    } catch (err) {
      setError('Fout bij het verplaatsen van de les');
    }
  };

  const moveLessonDown = async (moduleId: number, lessonIndex: number) => {
    const module = courseData?.modules.find(m => m.id === moduleId);
    if (!module || lessonIndex >= module.lessons.length - 1) return; // Already at bottom

    const lessons = [...module.lessons];
    const lesson = lessons[lessonIndex];
    const nextLesson = lessons[lessonIndex + 1];

    // Swap positions
    const tempPosition = lesson.position;
    lesson.position = nextLesson.position;
    nextLesson.position = tempPosition;

    try {
      // Update both lessons
      await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lesson.id,
          position: lesson.position,
        }),
      });

      await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: nextLesson.id,
          position: nextLesson.position,
        }),
      });

      setSuccess('Les verplaatst!');
      fetchCourseData();
    } catch (err) {
      setError('Fout bij het verplaatsen van de les');
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'audio':
        return <Headphones className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <p>Laden...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Cursus niet gevonden</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = '/admin/courses')}
            className="mb-2"
          >
            ← Terug naar Cursussen
          </Button>
          <h1 className="text-3xl font-bold">{courseData.title}</h1>
          {courseData.description && (
            <p className="text-muted-foreground mt-2">{courseData.description}</p>
          )}
        </div>

        <Dialog
          open={isModuleDialogOpen}
          onOpenChange={(open) => {
            setIsModuleDialogOpen(open);
            if (!open) {
              // Reset form when closing
              setEditingModuleId(null);
              setCurrentModuleNumber(0);
              setModuleForm({ title: '', description: '', image_url: '', video_url: '' });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSuccess(null); // Clear any previous success messages
              setError(null); // Clear any previous error messages
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Module
            </Button>
          </DialogTrigger>
          <DialogContent key={editingModuleId || 'new'}>
            <DialogHeader>
              <DialogTitle>
                {editingModuleId ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {currentModuleNumber}
                    </span>
                    <span>Module {currentModuleNumber} bewerken</span>
                  </div>
                ) : (
                  'Nieuwe module aanmaken'
                )}
              </DialogTitle>
              <DialogDescription>
                {editingModuleId ? 'Wijzig de module gegevens' : 'Maak een nieuwe module (hoofdstuk) aan'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <Label htmlFor="module-title">Module Titel *</Label>
                <Input
                  id="module-title"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="module-description">Beschrijving</Label>
                <Textarea
                  id="module-description"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                <div>
                  <Label className="text-base font-semibold">Module Media</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upload een afbeelding en/of video voor deze module
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="module-image" className="text-sm font-medium">
                      📷 Module Afbeelding
                    </Label>
                    <Input
                      id="module-image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleModuleImageUpload}
                      disabled={uploadingModuleImage}
                      className="cursor-pointer"
                    />
                    {uploadingModuleImage && (
                      <p className="text-xs text-muted-foreground">Uploaden...</p>
                    )}
                    {moduleForm.image_url && (
                      <div className="mt-2">
                        <img
                          src={moduleForm.image_url}
                          alt="Module preview"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setModuleForm({ ...moduleForm, image_url: '' })}
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

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="module-video" className="text-sm font-medium">
                      🎥 Module Video
                    </Label>
                    <Input
                      id="module-video"
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleModuleVideoUpload}
                      disabled={uploadingModuleVideo}
                      className="cursor-pointer"
                    />
                    {uploadingModuleVideo && (
                      <p className="text-xs text-muted-foreground">Uploaden...</p>
                    )}
                    {moduleForm.video_url && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-medium text-green-800">✓ Video geüpload:</p>
                        <p className="text-xs text-green-600 truncate mt-1">{moduleForm.video_url}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setModuleForm({ ...moduleForm, video_url: '' })}
                          className="mt-1 text-xs"
                        >
                          Verwijderen
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Max 100MB • MP4, WebM, OGG, MOV
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsModuleDialogOpen(false);
                  setEditingModuleId(null);
                  setCurrentModuleNumber(0);
                  setModuleForm({ title: '', description: '', image_url: '', video_url: '' });
                }}>
                  Annuleren
                </Button>
                <Button type="submit">{editingModuleId ? 'Module Bijwerken' : 'Module Aanmaken'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          <CardTitle>Modules & Lessen</CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.modules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nog geen modules. Maak je eerste module aan!
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {courseData.modules.map((module, idx) => (
                <AccordionItem key={module.id} value={`module-${module.id}`}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold">{module.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {module.lessons.length} les{module.lessons.length !== 1 ? 'sen' : ''}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {module.description && (
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      )}

                      {/* Module Media Display */}
                      {(module.image_url || module.video_url) && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/20 rounded-lg">
                          {module.image_url && (
                            <div>
                              <p className="text-xs font-medium mb-2">Module Afbeelding:</p>
                              <img
                                src={module.image_url}
                                alt={module.title}
                                className="w-full h-32 object-cover rounded border"
                              />
                            </div>
                          )}
                          {module.video_url && (
                            <div>
                              <p className="text-xs font-medium mb-2">Module Video:</p>
                              <video
                                src={module.video_url}
                                controls
                                className="w-full h-32 rounded border"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditModule(module, idx + 1)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Module Bewerken
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setEditingLessonId(null);
                            setCurrentModuleNumber(idx + 1);
                            setSuccess(null); // Clear any previous success messages
                            setError(null); // Clear any previous error messages
                            setIsLessonDialogOpen(true);
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Les Toevoegen
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteModule(module.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Module Verwijderen
                        </Button>
                      </div>

                      {module.lessons.length > 0 ? (
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIdx) => {
                            const courseNumber = getCourseNumber();
                            const lessonNumber = courseNumber ? `${courseNumber}.${idx + 1}.${lessonIdx + 1}` : `${idx + 1}.${lessonIdx + 1}`;

                            return (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/30 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary text-foreground text-xs font-semibold">
                                  {lessonNumber}
                                </span>
                                {getLessonIcon(lesson.lesson_type)}
                                <div>
                                  <p className="font-medium">{lesson.title}</p>
                                  {lesson.description && (
                                    <p className="text-sm text-muted-foreground">
                                      {lesson.description}
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-secondary px-2 py-0.5 rounded capitalize">
                                      {lesson.lesson_type}
                                    </span>
                                    {lesson.is_preview && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveLessonUp(module.id, lessonIdx)}
                                  disabled={lessonIdx === 0}
                                  title="Verplaats omhoog"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveLessonDown(module.id, lessonIdx)}
                                  disabled={lessonIdx === module.lessons.length - 1}
                                  title="Verplaats omlaag"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditLesson(lesson, `${idx + 1}.${lessonIdx + 1}`)}
                                  title="Bewerk les"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteLesson(lesson.id)}
                                  title="Verwijder les"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nog geen lessen in deze module
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLessonId ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-md bg-secondary text-foreground text-sm font-semibold">
                    {currentLessonNumber}
                  </span>
                  <span>Les {currentLessonNumber} bewerken</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {currentModuleNumber}
                  </span>
                  <span>Nieuwe les voor module {currentModuleNumber}</span>
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingLessonId ? 'Wijzig de les gegevens' : `Voeg een nieuwe les toe aan module ${currentModuleNumber}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Les Titel *</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="lesson-description">Beschrijving</Label>
              <Textarea
                id="lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="lesson-type">Les Type</Label>
              <Select
                value={lessonForm.lesson_type}
                onValueChange={(value: any) => setLessonForm({ ...lessonForm, lesson_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="text">Tekst</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="assignment">Opdracht</SelectItem>
                  <SelectItem value="slides">Slides</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload - Available for all lesson types */}
            <div className="space-y-2">
              <Label htmlFor="lesson-image" className="text-sm font-medium">
                📷 Les Afbeelding (Optioneel)
              </Label>
              <Input
                id="lesson-image"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleLessonImageUpload}
                disabled={uploadingLessonImage}
                className="cursor-pointer"
              />
              {uploadingLessonImage && (
                <p className="text-xs text-muted-foreground">Uploaden...</p>
              )}
              {lessonForm.image_url && (
                <div className="mt-2">
                  <img
                    src={lessonForm.image_url}
                    alt="Les preview"
                    className="w-full h-32 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLessonForm({ ...lessonForm, image_url: '' })}
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

            {lessonForm.lesson_type === 'video' && (
              <>
                <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                  <div>
                    <Label className="text-base font-semibold">Video Bron</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload een videobestand of plak een URL van YouTube, Vimeo, HeyGen, etc.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Upload Option */}
                    <div className="space-y-2">
                      <Label htmlFor="video-upload" className="text-sm font-medium">
                        📁 Upload Video Bestand
                      </Label>
                      <Input
                        id="video-upload"
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                        className="cursor-pointer"
                      />
                      {uploadingVideo && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Uploaden...</p>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '50%' }} />
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Max 100MB • MP4, WebM, OGG, MOV
                      </p>
                    </div>

                    {/* URL Option */}
                    <div className="space-y-2">
                      <Label htmlFor="video-url" className="text-sm font-medium">
                        🔗 Of plak Video URL
                      </Label>
                      <Input
                        id="video-url"
                        type="text"
                        value={lessonForm.video_url}
                        onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                        disabled={uploadingVideo}
                      />
                      <p className="text-xs text-muted-foreground">
                        YouTube, Vimeo, HeyGen, etc.
                      </p>
                    </div>
                  </div>

                  {lessonForm.video_url && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-medium text-green-800">✓ Video URL ingesteld:</p>
                      <p className="text-xs text-green-600 truncate mt-1">{lessonForm.video_url}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="video-duration">Video Duur (seconden) - Optioneel</Label>
                  <Input
                    id="video-duration"
                    type="number"
                    min="0"
                    value={lessonForm.video_duration}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, video_duration: parseInt(e.target.value) || 0 })
                    }
                    placeholder="Bijv: 300 voor 5 minuten"
                  />
                </div>
              </>
            )}

            {lessonForm.lesson_type === 'audio' && (
              <div className="space-y-4 p-4 border rounded-lg bg-secondary/20">
                <div>
                  <Label className="text-base font-semibold">Audio Bron</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Plak een audio-URL (bijv. MP3-bestand) of gebruik een gehoste audiolink.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audio-url" className="text-sm font-medium">
                    🔗 Audio URL
                  </Label>
                  <Input
                    id="audio-url"
                    type="text"
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="https://cdn.example.com/audio.mp3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ondersteunt .mp3, .wav, .m4a en andere directe audiobestanden.
                  </p>
                </div>

                <div>
                  <Label htmlFor="audio-description">Beschrijving of script (optioneel)</Label>
                  <Textarea
                    id="audio-description"
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    rows={6}
                    placeholder="Beschrijf de audio of plak (een deel van) het script."
                  />
                </div>
              </div>
            )}

            {lessonForm.lesson_type === 'text' && (
              <div>
                <Label htmlFor="lesson-content">Les Inhoud</Label>
                <RichTextEditor
                  content={lessonForm.content}
                  onChange={(content) => setLessonForm({ ...lessonForm, content })}
                  placeholder="Schrijf hier de les inhoud met rijke opmaak..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Gebruik de toolbar voor opmaak, koppen, lijsten, links en afbeeldingen.
                </p>
              </div>
            )}

            {lessonForm.lesson_type === 'quiz' && (
              <div>
                <Label>Quiz Inhoud</Label>
                <div className="mt-2 p-4 border rounded-lg bg-secondary/20">
                  <QuizEditor
                    value={getQuizData()}
                    onChange={handleQuizDataChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Voeg meerkeuze vragen toe met antwoordopties en feedback voor elk antwoord.
                </p>
              </div>
            )}

            {lessonForm.lesson_type === 'assignment' && (
              <div>
                <Label htmlFor="assignment-content">Opdracht Inhoud</Label>
                <RichTextEditor
                  content={lessonForm.content}
                  onChange={(content) => setLessonForm({ ...lessonForm, content })}
                  placeholder="Beschrijf hier de opdracht..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Gebruik de toolbar voor opmaak, opsommingen en instructies.
                </p>
              </div>
            )}

            {lessonForm.lesson_type === 'slides' && (
              <div>
                <Label>Slides Inhoud</Label>
                <div className="mt-2 p-4 border rounded-lg bg-secondary/20">
                  <SlidesEditor
                    value={getSlidesData()}
                    onChange={handleSlidesDataChange}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Voeg meerdere slides toe met titels, inhoud en afbeeldingen.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsLessonDialogOpen(false);
                setEditingLessonId(null);
                setCurrentLessonNumber('');
                setCurrentModuleNumber(0);
                setLessonForm({
                  title: '',
                  description: '',
                  content: '',
                  lesson_type: 'video',
                  image_url: '',
                  video_url: '',
                  video_duration: 0,
                  is_preview: false,
                });
              }}>
                Annuleren
              </Button>
              <Button type="submit">{editingLessonId ? 'Les Bijwerken' : 'Les Aanmaken'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
