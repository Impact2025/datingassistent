'use client';

/**
 * Q&A Sessions Calendar - Shows upcoming and past Q&A sessions
 *
 * Features:
 * - Displays upcoming sessions with Zoom links
 * - Shows past sessions with recordings (if available)
 * - Clean, mobile-responsive design
 * - Real-time date/time display
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Users,
  PlayCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QASession {
  id: number;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  durationMinutes: number;
  zoomLink: string | null;
  zoomMeetingId: string | null;
  maxParticipants: number;
  status: string;
  program: string;
  isRecordingAvailable: boolean;
  recordingUrl?: string | null;
}

export function QASessionsCalendar() {
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPastSessions, setShowPastSessions] = useState(false);

  // Fetch sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = localStorage.getItem('datespark_auth_token');

        // Skip fetch if no auth token (user not logged in)
        if (!token) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/transformatie/qa-sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Handle 401 gracefully - just show empty state
        if (response.status === 401) {
          setSessions([]);
          setLoading(false);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch sessions');

        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        console.error('Error fetching Q&A sessions:', err);
        // Don't show error, just show empty state for better UX
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sessions.filter((session) => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`);
    return sessionDateTime >= now && session.status !== 'cancelled';
  });

  const pastSessions = sessions.filter((session) => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`);
    return sessionDateTime < now || session.status === 'completed';
  });

  // Format date for display
  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return {
      date: date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isToday: date.toDateString() === new Date().toDateString(),
      isTomorrow: date.toDateString() === new Date(Date.now() + 86400000).toDateString(),
    };
  };

  // Calculate days until session
  const getDaysUntil = (dateStr: string) => {
    const sessionDate = new Date(dateStr);
    const today = new Date();
    const diffTime = sessionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Q&A sessies laden...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Show friendly empty state when no sessions exist
  if (sessions.length === 0) {
    return (
      <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Geen Q&A sessies gepland</h3>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Er zijn momenteel geen live Q&A sessies ingepland. Check later terug voor updates!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              Aankomende Q&A Sessies
              <Badge className="ml-auto bg-pink-100 text-pink-700 border-0">
                {upcomingSessions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.map((session) => {
              const formatted = formatDate(session.date, session.time);
              const daysUntil = getDaysUntil(session.date);

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 rounded-xl border-2 bg-white shadow-sm transition-all hover:shadow-md',
                    formatted.isToday ? 'border-green-400 bg-green-50' : 'border-gray-200'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {session.title}
                      </h3>
                      {session.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {session.description}
                        </p>
                      )}
                    </div>
                    {formatted.isToday && (
                      <Badge className="bg-green-500 text-white border-0 ml-2">
                        Vandaag!
                      </Badge>
                    )}
                    {formatted.isTomorrow && (
                      <Badge className="bg-blue-500 text-white border-0 ml-2">
                        Morgen
                      </Badge>
                    )}
                  </div>

                  {/* Session Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="capitalize">{formatted.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{formatted.time} ({session.durationMinutes} min)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>Max {session.maxParticipants} deelnemers</span>
                    </div>
                  </div>

                  {/* Days Until */}
                  {daysUntil > 0 && !formatted.isToday && (
                    <p className="text-xs text-gray-500 mb-3">
                      Over {daysUntil} {daysUntil === 1 ? 'dag' : 'dagen'}
                    </p>
                  )}

                  {/* Zoom Link */}
                  {session.zoomLink ? (
                    <Button
                      onClick={() => window.open(session.zoomLink!, '_blank')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Deelnemen via Zoom
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
                      Zoom link wordt binnenkort toegevoegd
                    </div>
                  )}
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* No Upcoming Sessions */}
      {upcomingSessions.length === 0 && (
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-1">Geen aankomende Q&A sessies</p>
            <p className="text-sm text-gray-500">
              Check later voor nieuwe sessies
            </p>
          </CardContent>
        </Card>
      )}

      {/* Past Sessions (Collapsible) */}
      {pastSessions.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <button
              onClick={() => setShowPastSessions(!showPastSessions)}
              className="w-full flex items-center justify-between text-left hover:opacity-80 transition-opacity"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-gray-600" />
                Eerdere Sessies
                <Badge className="bg-gray-100 text-gray-700 border-0">
                  {pastSessions.length}
                </Badge>
              </CardTitle>
              {showPastSessions ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </CardHeader>

          <AnimatePresence>
            {showPastSessions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="space-y-2">
                  {pastSessions.map((session) => {
                    const formatted = formatDate(session.date, session.time);

                    return (
                      <div
                        key={session.id}
                        className="p-3 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">
                              {session.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {formatted.date} • {formatted.time}
                            </p>
                          </div>
                          {session.isRecordingAvailable && (
                            <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                              Opname
                            </Badge>
                          )}
                        </div>

                        {session.isRecordingAvailable && session.recordingUrl ? (
                          <Button
                            onClick={() => window.open(session.recordingUrl!, '_blank')}
                            variant="outline"
                            size="sm"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Bekijk Opname
                          </Button>
                        ) : (
                          <p className="text-xs text-gray-400 text-center">
                            Geen opname beschikbaar
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}
