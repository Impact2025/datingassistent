'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { toSentenceCase } from '@/lib/utils';
import {
  Trophy,
  Award,
  Star,
  Target,
  BookOpen,
  CheckCircle,
  Download,
  Share,
  Calendar,
  TrendingUp,
  Medal,
  Crown,
  Zap,
  Heart,
  Users
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'course' | 'progress' | 'engagement' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

interface Certificate {
  id: number;
  course_id: number;
  course_title: string;
  completion_date: string;
  certificate_number: string;
  download_url?: string;
}

interface AchievementSystemProps {
  userId: number;
  showCertificates?: boolean;
  compact?: boolean;
}

export function AchievementSystem({
  userId,
  showCertificates = true,
  compact = false
}: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    fetchAchievements();
    if (showCertificates) {
      fetchCertificates();
    }
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      // Mock achievements data - in real implementation, this would come from API
      const mockAchievements: Achievement[] = [
        {
          id: 'first-course',
          title: 'Eerste Cursus Voltooid',
          description: 'Je hebt je eerste dating cursus succesvol afgerond!',
          icon: 'Trophy',
          category: 'course',
          rarity: 'common',
          points: 100,
          unlocked_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 'quiz-master',
          title: 'Quiz Meester',
          description: 'Behaal 90% of hoger op 5 verschillende quizzes',
          icon: 'Target',
          category: 'progress',
          rarity: 'rare',
          points: 250,
          unlocked_at: '2024-01-20T14:30:00Z'
        },
        {
          id: 'consistent-learner',
          title: 'Doorzetter',
          description: 'Leer 7 dagen achter elkaar',
          icon: 'TrendingUp',
          category: 'engagement',
          rarity: 'epic',
          points: 500,
          unlocked_at: '2024-01-25T09:15:00Z'
        },
        {
          id: 'profile-expert',
          title: 'Profiel Expert',
          description: 'Voltooi alle profiel-gerelateerde cursussen',
          icon: 'Star',
          category: 'milestone',
          rarity: 'legendary',
          points: 1000,
          progress: 2,
          max_progress: 3
        },
        {
          id: 'community-helper',
          title: 'Community Helper',
          description: 'Help 10 andere leden met advies',
          icon: 'Users',
          category: 'engagement',
          rarity: 'rare',
          points: 300,
          progress: 7,
          max_progress: 10
        }
      ];

      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      // Mock certificates data - in real implementation, this would come from API
      const mockCertificates: Certificate[] = [
        {
          id: 1,
          course_id: 33,
          course_title: 'Je profieltekst die wél werkt',
          completion_date: '2024-01-15T10:00:00Z',
          certificate_number: 'CERT-2024-001',
          download_url: '/certificates/cert-2024-001.pdf'
        }
      ];

      setCertificates(mockCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Trophy, Award, Star, Target, BookOpen, CheckCircle, Medal, Crown, Zap, Heart, Users, TrendingUp
    };
    return icons[iconName] || Trophy;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course': return <BookOpen className="h-3 w-3" />;
      case 'progress': return <TrendingUp className="h-3 w-3" />;
      case 'engagement': return <Users className="h-3 w-3" />;
      case 'milestone': return <Crown className="h-3 w-3" />;
      default: return <Award className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPoints = achievements
    .filter(a => a.unlocked_at)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter(a => a.unlocked_at).length;
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3">Prestaties laden...</span>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <div className="font-medium">{totalPoints} punten</div>
            <div className="text-sm text-muted-foreground">
              {unlockedCount}/{totalAchievements} achievements
            </div>
          </div>
        </div>

        <div className="flex gap-1">
          {achievements.slice(0, 5).map((achievement) => {
            const IconComponent = getAchievementIcon(achievement.icon);
            return (
              <div
                key={achievement.id}
                className={`p-1 rounded border ${
                  achievement.unlocked_at
                    ? getRarityColor(achievement.rarity)
                    : 'bg-gray-50 border-gray-200'
                }`}
                title={achievement.title}
              >
                <IconComponent className={`h-3 w-3 ${
                  achievement.unlocked_at ? '' : 'text-gray-400'
                }`} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Jouw Prestaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Totaal Punten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unlockedCount}</div>
              <div className="text-sm text-muted-foreground">Achievements Vrijgespeeld</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificaten</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Section */}
      {showCertificates && certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500" />
              Certificaten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{toSentenceCase(cert.course_title)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Voltooid op {formatDate(cert.completion_date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Certificaatnummer: {cert.certificate_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Share className="h-4 w-4" />
                      Delen
                    </Button>
                    {cert.download_url && (
                      <Button size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-purple-500" />
            Achievements ({unlockedCount}/{totalAchievements})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.icon);
              const isUnlocked = !!achievement.unlocked_at;

              return (
                <Dialog key={achievement.id}>
                  <DialogTrigger asChild>
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium truncate ${
                              isUnlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {achievement.title}
                            </h4>
                            {getCategoryIcon(achievement.category)}
                          </div>

                          <p className={`text-sm mb-2 line-clamp-2 ${
                            isUnlocked ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>

                            <div className="flex items-center gap-1">
                              <Star className={`h-3 w-3 ${
                                isUnlocked ? 'text-yellow-500' : 'text-gray-400'
                              }`} />
                              <span className={`text-xs font-medium ${
                                isUnlocked ? 'text-gray-700' : 'text-gray-400'
                              }`}>
                                {achievement.points}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar for locked achievements */}
                          {achievement.progress !== undefined && achievement.max_progress && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Voortgang</span>
                                <span>{achievement.progress}/{achievement.max_progress}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(achievement.progress / achievement.max_progress) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Unlocked date */}
                          {isUnlocked && achievement.unlocked_at && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>Vrijgespeeld {formatDate(achievement.unlocked_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${
                            isUnlocked ? 'text-yellow-600' : 'text-gray-400'
                          }`} />
                        </div>
                        {achievement.title}
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <p className="text-muted-foreground">{achievement.description}</p>

                      <div className="flex items-center justify-between">
                        <Badge className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{achievement.points} punten</span>
                        </div>
                      </div>

                      {achievement.progress !== undefined && achievement.max_progress && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Voortgang</span>
                            <span>{achievement.progress}/{achievement.max_progress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${(achievement.progress / achievement.max_progress) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {isUnlocked && achievement.unlocked_at && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                          <CheckCircle className="h-4 w-4" />
                          <span>Vrijgespeeld op {formatDate(achievement.unlocked_at)}</span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}