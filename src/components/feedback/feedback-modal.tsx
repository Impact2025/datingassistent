"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  MessageSquare,
  Bug,
  Lightbulb,
  Star,
  Send,
  CheckCircle,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'manual' | 'auto' | 'error';
  context?: {
    page?: string;
    tool?: string;
    error?: string;
  };
}

const FEEDBACK_TYPES = [
  {
    id: 'bug',
    label: 'Bug Report',
    icon: Bug,
    description: 'Iemand gevonden die niet hoort te werken',
    color: 'text-red-600'
  },
  {
    id: 'feature',
    label: 'Feature Request',
    icon: Lightbulb,
    description: 'Ik heb een idee voor een nieuwe functie',
    color: 'text-blue-600'
  },
  {
    id: 'improvement',
    label: 'Verbetering',
    icon: ThumbsUp,
    description: 'Suggestie om iets beter te maken',
    color: 'text-green-600'
  },
  {
    id: 'general',
    label: 'Algemene Feedback',
    icon: MessageSquare,
    description: 'Overig commentaar of vraag',
    color: 'text-purple-600'
  }
];

export function FeedbackModal({ isOpen, onClose, trigger = 'manual', context }: FeedbackModalProps) {
  const { user } = useUser();
  const [step, setStep] = useState<'type' | 'details' | 'rating' | 'submit'>('type');
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill based on trigger
  React.useEffect(() => {
    if (trigger === 'error' && context?.error) {
      setFeedbackType('bug');
      setTitle('Fout opgetreden');
      setDescription(`Ik kreeg deze fout: ${context.error}`);
      setStep('details');
    }
  }, [trigger, context]);

  const handleTypeSelect = (type: string) => {
    setFeedbackType(type);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!user?.id || !feedbackType || !title || !description) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: feedbackType,
          title,
          description,
          rating,
          category: category || undefined,
          page: context?.page || window.location.pathname,
          userAgent: navigator.userAgent,
          metadata: {
            trigger,
            tool: context?.tool,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setFeedbackType('');
    setTitle('');
    setDescription('');
    setRating(null);
    setCategory('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bedankt voor je feedback!
            </h3>
            <p className="text-gray-600">
              We waarderen je input en zullen er zo snel mogelijk naar kijken.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Deel je feedback
          </DialogTitle>
        </DialogHeader>

        {step === 'type' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Wat voor soort feedback wil je delen?
            </p>

            <div className="grid gap-3">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${type.color}`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{type.label}</h4>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Korte beschrijving van je feedback..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Vertel ons meer details..."
                rows={4}
                className="mt-1"
              />
            </div>

            {feedbackType !== 'bug' && (
              <div>
                <Label>Categorie (optioneel)</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ui-ux">UI/UX</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="other">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                Terug
              </Button>
              <Button
                onClick={() => setStep('rating')}
                disabled={!title.trim() || !description.trim()}
                className="flex-1"
              >
                Volgende
              </Button>
            </div>
          </div>
        )}

        {step === 'rating' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Hoe tevreden ben je overall?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Dit helpt ons om prioriteit te geven aan verbeteringen
              </p>
            </div>

            <RadioGroup
              value={rating?.toString() || ''}
              onValueChange={(value) => setRating(parseInt(value))}
              className="flex justify-center gap-2"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="flex flex-col items-center">
                  <RadioGroupItem
                    value={star.toString()}
                    id={`rating-${star}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`rating-${star}`}
                    className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating && star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </Label>
                  <span className="text-xs text-gray-500 mt-1">{star}</span>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                Terug
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Versturen...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Verstuur Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}