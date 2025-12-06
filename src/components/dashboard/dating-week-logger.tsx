"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  Heart,
  MessageCircle,
  Coffee,
  UserX,
  Sparkles,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface WeeklyLogData {
  activities: string[];
  activityDetails: {
    [key: string]: any;
  };
  weekStart: string;
  weekEnd: string;
  irisInsight?: string;
}

interface ActivityOption {
  id: string;
  label: string;
  icon: any;
  color: string;
  description: string;
}

interface DatingWeekLoggerProps {
  onComplete: (data: WeeklyLogData) => void;
  onCancel: () => void;
}

// Activity options
const activityOptions: ActivityOption[] = [
  {
    id: 'new_match',
    label: 'Nieuwe Match',
    icon: Heart,
    color: 'yellow',
    description: 'Nieuwe connectie gemaakt'
  },
  {
    id: 'conversation',
    label: 'Leuk Gesprek',
    icon: MessageCircle,
    color: 'blue',
    description: 'Actief gesprek gaande'
  },
  {
    id: 'date',
    label: 'Date Gehad',
    icon: Coffee,
    color: 'pink',
    description: 'Afgesproken voor een date'
  },
  {
    id: 'ghosting',
    label: 'Ghosting',
    icon: UserX,
    color: 'gray',
    description: 'Ervaring met verdwijnen'
  },
  {
    id: 'no_activity',
    label: 'Geen Activiteit',
    icon: Calendar,
    color: 'green',
    description: 'Deze week even geen dating'
  }
];

export function DatingWeekLogger({ onComplete, onCancel }: DatingWeekLoggerProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [activityDetails, setActivityDetails] = useState<{[key: string]: any}>({});
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [irisInsight, setIrisInsight] = useState<string>('');

  // Calculate current week dates
  const getCurrentWeekDates = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1); // Monday of current week

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Sunday of current week

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  };

  const weekDates = getCurrentWeekDates();

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const updateActivityDetail = (activityId: string, data: any) => {
    setActivityDetails(prev => ({
      ...prev,
      [activityId]: data
    }));
  };

  const generateIrisInsight = async () => {
    if (!user?.id) return;

    setIsGeneratingInsight(true);
    try {
      const response = await fetch('/api/dating-log/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          activities: selectedActivities,
          activityDetails,
          weekStart: weekDates.start,
          weekEnd: weekDates.end
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIrisInsight(data.insight);
      }
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedActivities.length > 0) {
      // Generate insight when moving to step 3
      generateIrisInsight();
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    const logData: WeeklyLogData = {
      activities: selectedActivities,
      activityDetails,
      weekStart: weekDates.start,
      weekEnd: weekDates.end,
      irisInsight: irisInsight || undefined
    };
    onComplete(logData);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedActivities.length > 0;
      case 2:
        // Check if all selected activities have required details
        return selectedActivities.every(activityId => {
          const details = activityDetails[activityId];
          if (!details) return false;

          switch (activityId) {
            case 'new_match':
              return details.platform && details.qualityRating;
            case 'conversation':
              return details.matchName && details.status;
            case 'date':
              return details.type && details.atmosphere;
            case 'ghosting':
              return true; // Optional details
            case 'no_activity':
              return true; // No details required
            default:
              return true;
          }
        });
      case 3:
        return !isGeneratingInsight;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ActivitySelectionStep
            activities={activityOptions}
            selectedActivities={selectedActivities}
            onToggleActivity={toggleActivity}
          />
        );
      case 2:
        return (
          <ActivityDetailsStep
            selectedActivities={selectedActivities}
            activityDetails={activityDetails}
            onUpdateDetail={updateActivityDetail}
          />
        );
      case 3:
        return (
          <IrisInsightStep
            insight={irisInsight}
            isGenerating={isGeneratingInsight}
          />
        );
      case 4:
        return (
          <ConfirmationStep
            selectedActivities={selectedActivities}
            activityDetails={activityDetails}
            insight={irisInsight}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-purple-600">Mijn Dating Week</h2>
            <p className="text-sm text-muted-foreground">
              Iris helpt je vooruitgang bij te houden — dit duurt 30 seconden.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Stap {currentStep} van 4</span>
            <span className="text-sm text-muted-foreground">
              Week van {new Date(weekDates.start).toLocaleDateString('nl-NL')} - {new Date(weekDates.end).toLocaleDateString('nl-NL')}
            </span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={isGeneratingInsight}
        >
          {currentStep === 1 ? 'Annuleren' : <><ArrowLeft className="w-4 h-4 mr-2" />Vorige</>}
        </Button>

        <Button
          onClick={currentStep === 4 ? handleComplete : handleNext}
          disabled={!canProceed() || isGeneratingInsight}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {currentStep === 4 ? (
            <>✨ Week registreren</>
          ) : (
            <>Volgende<ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// Step Components
function ActivitySelectionStep({
  activities,
  selectedActivities,
  onToggleActivity
}: {
  activities: ActivityOption[];
  selectedActivities: string[];
  onToggleActivity: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Wat gebeurde er deze week?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecteer alles wat van toepassing is
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const isSelected = selectedActivities.includes(activity.id);

            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                  isSelected
                    ? `bg-${activity.color}-50 border-${activity.color}-300`
                    : "hover:bg-gray-50"
                )}
                onClick={() => onToggleActivity(activity.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => onToggleActivity(activity.id)}
                  className="pointer-events-none"
                />
                <Icon className={cn(
                  "w-5 h-5",
                  isSelected ? `text-${activity.color}-600` : "text-gray-400"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{activity.label}</div>
                  <div className="text-sm text-muted-foreground">{activity.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Form Components
function NewMatchForm({ details, onUpdate }: { details: any; onUpdate: (data: any) => void }) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...details, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-4 h-4 text-yellow-600" />
        <span className="font-medium text-yellow-900">Nieuwe Match Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform" className="text-sm font-medium">Platform</Label>
          <Select value={details.platform || ''} onValueChange={(value) => updateField('platform', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tinder">Tinder</SelectItem>
              <SelectItem value="bumble">Bumble</SelectItem>
              <SelectItem value="hinge">Hinge</SelectItem>
              <SelectItem value="happn">Happn</SelectItem>
              <SelectItem value="okcupid">OkCupid</SelectItem>
              <SelectItem value="match">Match</SelectItem>
              <SelectItem value="anders">Anders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Kwaliteit van de match</Label>
          <RadioGroup
            value={details.qualityRating || ''}
            onValueChange={(value) => updateField('qualityRating', value)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="text-sm">Laag</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="text-sm">Gemiddeld</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="text-sm">Hoog</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium">Notities (optioneel)</Label>
        <Textarea
          id="notes"
          placeholder="Bijv. leuke foto, goede bio, gedeelde interesses..."
          value={details.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function ConversationForm({ details, onUpdate }: { details: any; onUpdate: (data: any) => void }) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...details, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-blue-900">Gesprek Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="matchName" className="text-sm font-medium">Naam van de match</Label>
          <Input
            id="matchName"
            placeholder="Bijv. Sarah, Mike..."
            value={details.matchName || ''}
            onChange={(e) => updateField('matchName', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium">Status van het gesprek</Label>
          <Select value={details.status || ''} onValueChange={(value) => updateField('status', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecteer status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="just_started">Net begonnen</SelectItem>
              <SelectItem value="ongoing">Lopend gesprek</SelectItem>
              <SelectItem value="deep_conversation">Diepgaand gesprek</SelectItem>
              <SelectItem value="planning_date">Date plannen</SelectItem>
              <SelectItem value="fading">Aan het vervagen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="conversationNotes" className="text-sm font-medium">Gesprek details (optioneel)</Label>
        <Textarea
          id="conversationNotes"
          placeholder="Bijv. klik over gedeelde hobby's, goede humor, plannen voor date..."
          value={details.conversationNotes || ''}
          onChange={(e) => updateField('conversationNotes', e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function DateForm({ details, onUpdate }: { details: any; onUpdate: (data: any) => void }) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...details, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Coffee className="w-4 h-4 text-pink-600" />
        <span className="font-medium text-pink-900">Date Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Type date</Label>
          <Select value={details.type || ''} onValueChange={(value) => updateField('type', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecteer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coffee">Koffie/drankje</SelectItem>
              <SelectItem value="dinner">Avondeten</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="walk">Wandeling</SelectItem>
              <SelectItem value="activity">Activiteit/hobby</SelectItem>
              <SelectItem value="home">Thuis koken</SelectItem>
              <SelectItem value="other">Anders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Sfeer/ervaring</Label>
          <Select value={details.atmosphere || ''} onValueChange={(value) => updateField('atmosphere', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecteer sfeer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="great">Geweldig! 😍</SelectItem>
              <SelectItem value="good">Goed, klik was er 🤝</SelectItem>
              <SelectItem value="okay">Okay, maar geen chemistry 🤷‍♀️</SelectItem>
              <SelectItem value="bad">Niet zo goed 😕</SelectItem>
              <SelectItem value="terrible">Slecht, nooit meer 📵</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="dateNotes" className="text-sm font-medium">Date ervaring (optioneel)</Label>
        <Textarea
          id="dateNotes"
          placeholder="Bijv. leuke gesprekken, goede chemistry, plannen voor volgende keer..."
          value={details.dateNotes || ''}
          onChange={(e) => updateField('dateNotes', e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function GhostingForm({ details, onUpdate }: { details: any; onUpdate: (data: any) => void }) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...details, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <UserX className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900">Ghosting Ervaring</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Wie ghostte er?</Label>
          <RadioGroup
            value={details.whoGhosted || ''}
            onValueChange={(value) => updateField('whoGhosted', value)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="me" id="me" />
              <Label htmlFor="me" className="text-sm">Ik ghostte iemand</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="them" id="them" />
              <Label htmlFor="them" className="text-sm">Iemand ghostte mij</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="ghostingNotes" className="text-sm font-medium">Details (optioneel)</Label>
          <Textarea
            id="ghostingNotes"
            placeholder="Bijv. reden, hoe het voelde, lessen geleerd..."
            value={details.ghostingNotes || ''}
            onChange={(e) => updateField('ghostingNotes', e.target.value)}
            rows={2}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function NoActivityForm({ details, onUpdate }: { details: any; onUpdate: (data: any) => void }) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...details, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-green-600" />
        <span className="font-medium text-green-900">Geen Activiteit</span>
      </div>

      <div>
        <Label htmlFor="reason" className="text-sm font-medium">Waarom geen dating deze week? (optioneel)</Label>
        <Textarea
          id="reason"
          placeholder="Bijv. druk met werk, ziek, vakantie, even een pauze..."
          value={details.reason || ''}
          onChange={(e) => updateField('reason', e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function ActivityDetailsStep({
  selectedActivities,
  activityDetails,
  onUpdateDetail
}: {
  selectedActivities: string[];
  activityDetails: {[key: string]: any};
  onUpdateDetail: (activityId: string, data: any) => void;
}) {
  // This will be implemented with sub-cards for each activity type
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details per activiteit</CardTitle>
        <p className="text-sm text-muted-foreground">
          Vertel meer over je ervaringen deze week
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {selectedActivities.map((activityId) => (
            <ActivityDetailCard
              key={activityId}
              activityId={activityId}
              details={activityDetails[activityId] || {}}
              onUpdate={(data) => onUpdateDetail(activityId, data)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityDetailCard({
  activityId,
  details,
  onUpdate
}: {
  activityId: string;
  details: any;
  onUpdate: (data: any) => void;
}) {
  const renderActivityForm = () => {
    switch (activityId) {
      case 'new_match':
        return <NewMatchForm details={details} onUpdate={onUpdate} />;
      case 'conversation':
        return <ConversationForm details={details} onUpdate={onUpdate} />;
      case 'date':
        return <DateForm details={details} onUpdate={onUpdate} />;
      case 'ghosting':
        return <GhostingForm details={details} onUpdate={onUpdate} />;
      case 'no_activity':
        return <NoActivityForm details={details} onUpdate={onUpdate} />;
      default:
        return <div className="text-sm text-muted-foreground">Onbekende activiteit</div>;
    }
  };

  const getBorderColor = () => {
    switch (activityId) {
      case 'new_match': return 'border-l-yellow-500';
      case 'conversation': return 'border-l-blue-500';
      case 'date': return 'border-l-pink-500';
      case 'ghosting': return 'border-l-gray-500';
      case 'no_activity': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()}`}>
      <CardContent className="pt-4">
        {renderActivityForm()}
      </CardContent>
    </Card>
  );
}

// Helper function to convert markdown to formatted HTML
function formatMarkdownToHtml(text: string): string {
  if (!text) return '';

  // Split into paragraphs by double newlines or **Section Headers**
  const formatted = text
    // Convert **bold** to <strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-700 font-semibold">$1</strong>')
    // Convert *italic* to <em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert newlines to <br> for single line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br />');

  // Wrap in paragraph tags
  return `<p class="mb-3">${formatted}</p>`;
}

function IrisInsightStep({
  insight,
  isGenerating
}: {
  insight: string;
  isGenerating: boolean;
}) {
  const formattedInsight = formatMarkdownToHtml(insight);

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Iris Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Iris analyseert je week...</span>
          </div>
        ) : (
          <div className="text-gray-700 leading-relaxed max-h-[300px] overflow-y-auto pr-2">
            {insight ? (
              <div
                className="space-y-2"
                dangerouslySetInnerHTML={{ __html: formattedInsight }}
              />
            ) : (
              <p className="text-muted-foreground">Geen insight beschikbaar</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ConfirmationStep({
  selectedActivities,
  activityDetails,
  insight
}: {
  selectedActivities: string[];
  activityDetails: {[key: string]: any};
  insight: string;
}) {
  // Get a clean preview without markdown
  const getCleanPreview = (text: string, maxLength: number = 200) => {
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\n/g, ' ')
      .trim();
    return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Klaar om op te slaan?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Controleer je samenvatting en sla je dating week op
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Activiteiten deze week:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedActivities.map((activityId) => (
                <Badge key={activityId} variant="secondary">
                  {activityOptions.find(a => a.id === activityId)?.label}
                </Badge>
              ))}
            </div>
          </div>

          {insight && (
            <div>
              <h4 className="font-medium mb-2">Iris zegt:</h4>
              <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg border border-purple-100">
                {getCleanPreview(insight)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}