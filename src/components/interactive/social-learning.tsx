"use client";

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Share2,
  Flag,
  Heart,
  Trophy,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';

interface ProfileReview {
  id: string;
  profileText: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  reviews: Review[];
  tags: string[];
  createdAt: Date;
  likes: number;
  isLiked: boolean;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  content: string;
  rating: number;
  helpful: number;
  createdAt: Date;
  isHelpful?: boolean;
}

interface SocialLearningProps {
  currentUserId?: string;
  onReviewSubmitted?: (review: Review) => void;
  onProfileShared?: (profile: ProfileReview) => void;
}

const SAMPLE_PROFILES: ProfileReview[] = [
  {
    id: '1',
    profileText: 'Ik ben een avontuurlijke kok die van spontane roadtrips houdt. Mijn guilty pleasure is koken om 2 uur \'s nachts. Op zoek naar iemand die mijn culinaire experimenten durft te proeven! 🥘✨',
    authorName: 'Chef Marie',
    rating: 4.8,
    reviews: [
      {
        id: 'r1',
        reviewerName: 'Dating Expert',
        content: 'Heel goed! De combinatie van hobby en kwetsbaarheid werkt perfect. De emoji voegt persoonlijkheid toe zonder overheersend te zijn.',
        rating: 5,
        helpful: 12,
        createdAt: new Date('2024-01-15'),
        isHelpful: true
      },
      {
        id: 'r2',
        reviewerName: 'Single Sarah',
        content: 'Dit lijkt me een leuk persoon! De vraag lokt echt uit tot reactie.',
        rating: 4,
        helpful: 8,
        createdAt: new Date('2024-01-14')
      }
    ],
    tags: ['creatief', 'avontuurlijk', 'humor'],
    createdAt: new Date('2024-01-10'),
    likes: 24,
    isLiked: false
  },
  {
    id: '2',
    profileText: 'Boekenwurm met een passie voor fotografie. Ik verzamel vintage camera\'s en schrijf korte verhalen. Zoek iemand om mijn verhalen mee te delen tijdens een lange wandeling in het bos. 📚📸',
    authorName: 'Storyteller Tom',
    rating: 4.6,
    reviews: [
      {
        id: 'r3',
        reviewerName: 'Creative Coach',
        content: 'Mooi specifiek! De combinatie van verschillende interesses maakt het boeiend. Misschien iets meer humor toevoegen?',
        rating: 4,
        helpful: 15,
        createdAt: new Date('2024-01-12'),
        isHelpful: true
      }
    ],
    tags: ['creatief', 'intellectueel', 'rustig'],
    createdAt: new Date('2024-01-08'),
    likes: 18,
    isLiked: true
  },
  {
    id: '3',
    profileText: 'Houd van reizen, lekker eten en gezelligheid.',
    authorName: 'Generic Guy',
    rating: 2.1,
    reviews: [
      {
        id: 'r4',
        reviewerName: 'Profile Pro',
        content: 'Dit is helaas heel generiek. Niemand zal hierop reageren omdat het niet onderscheidend is. Maak het persoonlijk!',
        rating: 1,
        helpful: 32,
        createdAt: new Date('2024-01-11'),
        isHelpful: true
      },
      {
        id: 'r5',
        reviewerName: 'Honest Hannah',
        content: 'Te vaag. Wat voor reizen? Welk eten? Wat betekent gezelligheid voor jou?',
        rating: 2,
        helpful: 19,
        createdAt: new Date('2024-01-10')
      }
    ],
    tags: ['generiek', 'verbetering nodig'],
    createdAt: new Date('2024-01-05'),
    likes: 3,
    isLiked: false
  }
];

export function SocialLearning({
  currentUserId,
  onReviewSubmitted,
  onProfileShared
}: SocialLearningProps) {
  const [profiles, setProfiles] = useState<ProfileReview[]>(SAMPLE_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<ProfileReview | null>(null);
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [activeTab, setActiveTab] = useState<'browse' | 'review' | 'share'>('browse');

  const handleLikeProfile = useCallback((profileId: string) => {
    setProfiles(prev => prev.map(profile =>
      profile.id === profileId
        ? {
            ...profile,
            likes: profile.isLiked ? profile.likes - 1 : profile.likes + 1,
            isLiked: !profile.isLiked
          }
        : profile
    ));
  }, []);

  const handleHelpfulReview = useCallback((profileId: string, reviewId: string) => {
    setProfiles(prev => prev.map(profile =>
      profile.id === profileId
        ? {
            ...profile,
            reviews: profile.reviews.map(review =>
              review.id === reviewId
                ? {
                    ...review,
                    helpful: review.isHelpful ? review.helpful - 1 : review.helpful + 1,
                    isHelpful: !review.isHelpful
                  }
                : review
            )
          }
        : profile
    ));
  }, []);

  const submitReview = useCallback(() => {
    if (!selectedProfile || !newReview.trim()) return;

    const review: Review = {
      id: `review-${Date.now()}`,
      reviewerName: 'Jij', // In real app, get from user profile
      content: newReview,
      rating: reviewRating,
      helpful: 0,
      createdAt: new Date(),
      isHelpful: false
    };

    setProfiles(prev => prev.map(profile =>
      profile.id === selectedProfile.id
        ? {
            ...profile,
            reviews: [...profile.reviews, review],
            rating: (profile.rating * profile.reviews.length + reviewRating) / (profile.reviews.length + 1)
          }
        : profile
    ));

    setNewReview('');
    setReviewRating(5);
    onReviewSubmitted?.(review);
  }, [selectedProfile, newReview, reviewRating, onReviewSubmitted]);

  const shareProfile = useCallback((profile: ProfileReview) => {
    // In a real app, this would open a share dialog or copy to clipboard
    navigator.clipboard.writeText(`Check dit profiel: "${profile.profileText}"`);
    onProfileShared?.(profile);
  }, [onProfileShared]);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4.5) return <Trophy className="w-4 h-4" />;
    if (rating >= 3.5) return <Star className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl">Community Learning</h2>
              <p className="text-sm text-muted-foreground">Leer van anderen en deel je inzichten</p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'browse' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('browse')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <Users className="w-4 h-4 mr-2" />
          Profielen Bekijken
        </Button>
        <Button
          variant={activeTab === 'review' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('review')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Reviews Geven
        </Button>
        <Button
          variant={activeTab === 'share' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('share')}
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Profiel Delen
        </Button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Profielen</h3>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              {profiles.length} profielen
            </Badge>
          </div>

          <div className="grid gap-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={profile.authorAvatar} />
                          <AvatarFallback>{profile.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{profile.authorName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {profile.createdAt.toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${getRatingColor(profile.rating)}`}>
                        {getRatingIcon(profile.rating)}
                        <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Profile Text */}
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">{profile.profileText}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {profile.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeProfile(profile.id)}
                          className={`gap-1 ${profile.isLiked ? 'text-red-500' : ''}`}
                        >
                          <Heart className={`w-4 h-4 ${profile.isLiked ? 'fill-current' : ''}`} />
                          {profile.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProfile(profile)}
                          className="gap-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          {profile.reviews.length} reviews
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareProfile(profile)}
                        className="gap-1"
                      >
                        <Share2 className="w-4 h-4" />
                        Delen
                      </Button>
                    </div>

                    {/* Reviews Preview */}
                    {profile.reviews.length > 0 && (
                      <div className="border-t pt-4 space-y-3">
                        <h5 className="font-medium text-sm">Recente Reviews:</h5>
                        {profile.reviews.slice(0, 2).map((review) => (
                          <div key={review.id} className="bg-background/50 p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {review.reviewerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{review.reviewerName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {review.createdAt.toLocaleDateString('nl-NL')}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHelpfulReview(profile.id, review.id)}
                                className={`text-xs gap-1 h-6 px-2 ${
                                  review.isHelpful ? 'text-green-600' : ''
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                {review.helpful}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review een Profiel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Kies een profiel om constructieve feedback te geven
              </p>
            </CardHeader>
            <CardContent>
              {!selectedProfile ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Selecteer een profiel om te reviewen
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Profielen Bekijken
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{selectedProfile.authorName}</h4>
                    <p className="text-sm">{selectedProfile.profileText}</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Je Beoordeling</label>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            onClick={() => setReviewRating(i + 1)}
                            className="p-1"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                i < reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Je Review</label>
                      <Textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Deel constructieve feedback..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={submitReview} disabled={!newReview.trim()}>
                        Review Versturen
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProfile(null)}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Tab */}
      {activeTab === 'share' && (
        <Card>
          <CardHeader>
            <CardTitle>Deel Je Profiel</CardTitle>
            <p className="text-sm text-muted-foreground">
              Laat anderen je profiel reviewen voor feedback
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Share2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Profiel delen functie komt binnenkort beschikbaar
              </p>
              <p className="text-xs text-muted-foreground">
                Gebruik voor nu de "Profielen Bekijken" tab om anderen te helpen
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-semibold text-green-900">Community Contributor</h4>
              <p className="text-sm text-green-700">
                Help anderen door reviews te geven en verdien community punten!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}