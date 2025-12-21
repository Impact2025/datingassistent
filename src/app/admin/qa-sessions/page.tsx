'use client';

/**
 * Admin Page: Q&A Sessions Management
 *
 * Allows admin to:
 * - View all Q&A sessions
 * - Create new sessions
 * - Edit existing sessions
 * - Delete sessions
 * - Add Zoom links manually
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QASession {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  zoomLink: string | null;
  zoomMeetingId: string | null;
  maxParticipants: number;
  status: string;
  program: string;
  isRecordingAvailable: boolean;
  recordingUrl: string | null;
}

export default function AdminQASessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    durationMinutes: 60,
    zoomLink: '',
    zoomMeetingId: '',
    maxParticipants: 100,
    status: 'scheduled',
    program: 'transformatie',
  });

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/qa-sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Kon sessies niet laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      durationMinutes: 60,
      zoomLink: '',
      zoomMeetingId: '',
      maxParticipants: 100,
      status: 'scheduled',
      program: 'transformatie',
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Create or update session
  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/qa-sessions/${editingId}`
        : '/api/admin/qa-sessions';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save session');
      }

      await fetchSessions();
      resetForm();
    } catch (err: any) {
      alert(`Fout: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete session
  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze sessie wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/admin/qa-sessions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      await fetchSessions();
    } catch (err) {
      alert('Kon sessie niet verwijderen');
    }
  };

  // Edit session
  const handleEdit = (session: QASession) => {
    setFormData({
      title: session.title,
      description: session.description || '',
      date: session.date,
      time: session.time.substring(0, 5), // HH:MM
      durationMinutes: session.durationMinutes,
      zoomLink: session.zoomLink || '',
      zoomMeetingId: session.zoomMeetingId || '',
      maxParticipants: session.maxParticipants,
      status: session.status,
      program: session.program,
    });
    setEditingId(session.id);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-pink-600" />
              Q&A Sessies Beheer
            </h1>
            <p className="text-gray-600 mt-1">
              Beheer live Q&A sessies voor het Transformatie programma
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Sessie
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-pink-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-white">
              <CardTitle className="flex items-center justify-between">
                <span>{editingId ? 'Sessie Bewerken' : 'Nieuwe Sessie'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Bijv. Week 1 Q&A - Welkom & Kennismaking"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beschrijf waar de sessie over gaat..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tijd *
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duur (minuten)
                  </label>
                  <Input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Deelnemers
                  </label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom Link
                  </label>
                  <Input
                    value={formData.zoomLink}
                    onChange={(e) => setFormData({ ...formData, zoomLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom Meeting ID (optioneel)
                  </label>
                  <Input
                    value={formData.zoomMeetingId}
                    onChange={(e) => setFormData({ ...formData, zoomMeetingId: e.target.value })}
                    placeholder="123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="scheduled">Gepland</option>
                    <option value="completed">Voltooid</option>
                    <option value="cancelled">Geannuleerd</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.title || !formData.date || !formData.time}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Opslaan
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                >
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Alle Sessies ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Nog geen sessies aangemaakt</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="border-gray-200 hover:border-pink-300 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {session.title}
                        </h3>
                        <Badge
                          className={cn(
                            session.status === 'scheduled' && 'bg-blue-100 text-blue-700',
                            session.status === 'completed' && 'bg-green-100 text-green-700',
                            session.status === 'cancelled' && 'bg-red-100 text-red-700'
                          )}
                        >
                          {session.status}
                        </Badge>
                        {session.zoomLink && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Video className="w-3 h-3 mr-1" />
                            Zoom Link
                          </Badge>
                        )}
                      </div>

                      {session.description && (
                        <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Datum:</span> {session.date}
                        </div>
                        <div>
                          <span className="font-medium">Tijd:</span> {session.time.substring(0, 5)}
                        </div>
                        <div>
                          <span className="font-medium">Duur:</span> {session.durationMinutes} min
                        </div>
                        <div>
                          <span className="font-medium">Max:</span> {session.maxParticipants} pers
                        </div>
                      </div>

                      {session.zoomLink && (
                        <div className="mt-2 text-xs text-gray-500 truncate">
                          <span className="font-medium">Zoom:</span>{' '}
                          <a
                            href={session.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {session.zoomLink}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(session)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
