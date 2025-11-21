"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import * as Lucide from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { ExtendedUserProfile, UserBadge } from '@/lib/types';

export function UserProfile() {
  const { user } = useUser();
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ExtendedUserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBadges();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/profile?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      const interestsArray = Array.isArray(data.profile?.interests)
        ? [...data.profile.interests]
        : [];

      setProfile({
        ...data.profile,
        interests: interestsArray,
      });
      setEditedProfile({
        bio: data.profile.bio,
        location: data.profile.location,
        interests: interestsArray,
      });
    } catch (err) {
      setError('Kon profiel niet laden');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(`/api/community/badges?userId=${user?.id}&type=user`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      
      const data = await response.json();
      setBadges(data.badges);
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/community/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          profileData: {
            ...editedProfile,
            interests: Array.isArray(editedProfile.interests)
              ? [...editedProfile.interests]
              : [],
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Refresh profile after save
      fetchProfile();
      setIsEditing(false);
    } catch (err) {
      setError('Kon profiel niet bijwerken');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Lucide.Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Profiel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchProfile} className="mt-2">Opnieuw proberen</Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Profiel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nog geen profiel gevonden. Maak je profiel aan om te beginnen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-secondary/50">
        <div 
          className="h-32 rounded-t-lg bg-gradient-to-r from-primary/20 to-blue-500/20"
          style={{
            backgroundImage: profile.coverPhotoUrl ? `url(${profile.coverPhotoUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <CardContent className="relative pt-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative -mt-16 h-24 w-24 rounded-full border-4 border-background bg-background">
                {profile.profilePictureUrl ? (
                  <img 
                    src={profile.profilePictureUrl} 
                    alt={profile.name} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                    <Lucide.User className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'Gebruiker'}</h2>
                <p className="text-muted-foreground">
                  Lid sinds {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('nl-NL') : 'Onbekend'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Lucide.Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{profile.reputationPoints || 0} reputatiepunten</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditing(!isEditing)}
              className="mt-4 md:mt-0"
            >
              {isEditing ? 'Annuleren' : 'Bewerk profiel'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      {badges.length > 0 && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lucide.Award className="text-primary" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1"
                >
                  <Lucide.Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{badge.badge.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Content */}
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle>Over mij</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                  rows={4}
                  placeholder="Vertel iets over jezelf..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Locatie</label>
                <Input
                  value={editedProfile.location || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                  placeholder="Waar woon je?"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Interesses</label>
                <Input
                  value={editedProfile.interests?.join(', ') || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, interests: e.target.value.split(', ').filter(i => i.trim() !== '')})}
                  placeholder="Scheiden met komma's"
                />
              </div>
              <Button onClick={handleSave}>Opslaan</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground">Nog geen bio toegevoegd.</p>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-2">
                  <Lucide.MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Interesses</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span 
                        key={index} 
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}