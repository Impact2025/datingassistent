"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageSquare,
  Calendar,
  Plus,
  Star,
  MapPin,
  Clock
} from "lucide-react";

interface DatingActivityLoggerProps {
  userId: number;
  onActivityAdded?: () => void;
}

export function DatingActivityLogger({ userId, onActivityAdded }: DatingActivityLoggerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityType, setActivityType] = useState<string>("");

  // Match form
  const [matchQuality, setMatchQuality] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");

  // Conversation form
  const [conversationLength, setConversationLength] = useState<string>("");
  const [wasMeaningful, setWasMeaningful] = useState<string>("");

  // Date form
  const [dateLocation, setDateLocation] = useState<string>("");
  const [dateRating, setDateRating] = useState<string>("");
  const [dateNotes, setDateNotes] = useState<string>("");

  const resetForm = () => {
    setActivityType("");
    setMatchQuality("");
    setPlatform("");
    setConversationLength("");
    setWasMeaningful("");
    setDateLocation("");
    setDateRating("");
    setDateNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityType) return;

    setIsSubmitting(true);

    try {
      const activityData: any = {
        userId,
        activityType,
        activityDate: new Date().toISOString().split('T')[0]
      };

      // Add type-specific data
      if (activityType === 'match') {
        activityData.matchQuality = parseInt(matchQuality);
        activityData.platform = platform;
      } else if (activityType === 'conversation') {
        activityData.conversationLength = parseInt(conversationLength);
        activityData.wasMeaningful = wasMeaningful === 'true';
      } else if (activityType === 'date') {
        activityData.dateLocation = dateLocation;
        activityData.dateRating = parseInt(dateRating);
        activityData.notes = dateNotes;
      }

      const response = await fetch('/api/dating-activities/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        toast({
          title: "Activiteit toegevoegd",
          description: "Je dating activiteit is succesvol geregistreerd.",
        });
        resetForm();
        onActivityAdded?.();
      } else {
        throw new Error('Failed to log activity');
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het registreren van je activiteit.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActivityForm = () => {
    switch (activityType) {
      case 'match':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tinder">Tinder</SelectItem>
                    <SelectItem value="bumble">Bumble</SelectItem>
                    <SelectItem value="hinge">Hinge</SelectItem>
                    <SelectItem value="happn">Happn</SelectItem>
                    <SelectItem value="other">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quality">Match kwaliteit (1-10)</Label>
                <Select value={matchQuality} onValueChange={setMatchQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies kwaliteit" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num >= 7 ? '⭐' : num >= 5 ? '👍' : '👎'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'conversation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="length">Gespreksduur (minuten)</Label>
                <Input
                  id="length"
                  type="number"
                  placeholder="15"
                  value={conversationLength}
                  onChange={(e) => setConversationLength(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="meaningful">Was het betekenisvol?</Label>
                <Select value={wasMeaningful} onValueChange={setWasMeaningful}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ja, goed gesprek</SelectItem>
                    <SelectItem value="false">Nee, oppervlakkig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Locatie</Label>
                <Input
                  id="location"
                  placeholder="Café Central"
                  value={dateLocation}
                  onChange={(e) => setDateLocation(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rating">Date beoordeling (1-10)</Label>
                <Select value={dateRating} onValueChange={setDateRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies beoordeling" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num >= 8 ? '💕' : num >= 6 ? '😊' : '😐'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Date Analyse & Reflectie</Label>
              <Textarea
                id="notes"
                placeholder="Beschrijf hoe de date verliep. Wat ging goed? Wat kon beter? Welke signalen heb je opgepikt? Wat heb je geleerd voor volgende dates?"
                value={dateNotes}
                onChange={(e) => setDateNotes(e.target.value)}
                rows={8}
                className="bg-blue-50/30 border-blue-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Gedetailleerde reflectie helpt je om te leren van elke ervaring
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-red-600">Dating Log</h2>
            <p className="text-sm text-muted-foreground">
              Registreer je dating activiteiten en leer van je ervaringen.
            </p>
          </div>
        </div>
      </div>

      <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selection */}
          <div>
            <Label>Wat wil je registreren?</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              <Button
                type="button"
                variant={activityType === 'match' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => setActivityType('match')}
              >
                <Heart className="w-6 h-6" />
                <span className="text-sm">Nieuwe Match</span>
              </Button>

              <Button
                type="button"
                variant={activityType === 'conversation' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => setActivityType('conversation')}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Gesprek</span>
              </Button>

              <Button
                type="button"
                variant={activityType === 'date' ? 'default' : 'outline'}
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => setActivityType('date')}
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Date</span>
              </Button>
            </div>
          </div>

          {/* Dynamic Form */}
          {activityType && (
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                {activityType === 'match' && <><Heart className="w-4 h-4" /> Match Details</>}
                {activityType === 'conversation' && <><MessageSquare className="w-4 h-4" /> Gesprek Details</>}
                {activityType === 'date' && <><Calendar className="w-4 h-4" /> Date Details</>}
              </h3>

              {renderActivityForm()}

              <div className="flex gap-3 mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registreren...' : 'Activiteit Registreren'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Quick Stats */}
        <div className="border-t pt-6 mt-6">
          <h4 className="font-medium mb-3">Deze maand:</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Gesprekken</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-xs text-muted-foreground">Dates</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}