'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ArticleFeedbackProps {
  articleSlug: string;
  articleTitle: string;
  className?: string;
}

type FeedbackState = 'initial' | 'positive' | 'negative' | 'submitted';

export function ArticleFeedback({ articleSlug, articleTitle, className }: ArticleFeedbackProps) {
  const [state, setState] = useState<FeedbackState>('initial');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (isHelpful: boolean) => {
    setState(isHelpful ? 'positive' : 'negative');

    // Track the vote
    try {
      await fetch('/api/kennisbank/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleSlug,
          articleTitle,
          isHelpful,
          feedback: null,
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setState('submitted');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/kennisbank/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleSlug,
          articleTitle,
          isHelpful: state === 'positive',
          feedback: feedback.trim(),
        }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
    setIsSubmitting(false);
    setState('submitted');
  };

  return (
    <div className={cn('border rounded-lg p-6 bg-card', className)}>
      <AnimatePresence mode="wait">
        {state === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <h3 className="font-semibold text-foreground mb-2">
              Was dit artikel nuttig?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Je feedback helpt ons de kennisbank te verbeteren
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleVote(true)}
                className="gap-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950/30"
              >
                <ThumbsUp className="w-5 h-5" />
                Ja, nuttig
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleVote(false)}
                className="gap-2 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/30"
              >
                <ThumbsDown className="w-5 h-5" />
                Kan beter
              </Button>
            </div>
          </motion.div>
        )}

        {(state === 'positive' || state === 'negative') && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className="mb-4">
              {state === 'positive' ? (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-2">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">Bedankt!</h3>
                  <p className="text-sm text-muted-foreground">
                    Fijn dat je dit artikel nuttig vond
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-2">
                    <ThumbsDown className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Bedankt voor je feedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Wat kunnen we verbeteren?
                  </p>
                </>
              )}
            </div>

            <div className="max-w-md mx-auto space-y-3">
              <Textarea
                placeholder={
                  state === 'positive'
                    ? 'Wat vond je het meest waardevol? (optioneel)'
                    : 'Wat miste je of kan beter? (optioneel)'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setState('submitted')}
                  disabled={isSubmitting}
                >
                  Overslaan
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Verstuur
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'submitted' && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3"
            >
              <Check className="w-7 h-7 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-1">
              Feedback ontvangen!
            </h3>
            <p className="text-sm text-muted-foreground">
              Bedankt dat je ons helpt de kennisbank te verbeteren
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
