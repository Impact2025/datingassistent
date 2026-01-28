'use client';

/**
 * Smart Contact Form Component
 * Intelligent contact form with category routing
 *
 * Features:
 * - Smart category detection
 * - File attachments
 * - Form validation
 * - Success feedback
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  User,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { TicketCategory } from '@/lib/support/types';

interface SmartContactFormProps {
  onSubmit?: (data: ContactFormData) => Promise<void>;
  className?: string;
  showTitle?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  category: TicketCategory;
  subject: string;
  message: string;
  attachments?: File[];
}

const CATEGORIES: { value: TicketCategory; label: string; description: string }[] = [
  {
    value: 'technical',
    label: 'Technisch probleem',
    description: 'Bug, error, of iets werkt niet',
  },
  {
    value: 'billing',
    label: 'Betaling & Abonnement',
    description: 'Facturen, opzeggen, of betalingsproblemen',
  },
  {
    value: 'account',
    label: 'Account hulp',
    description: 'Login, wachtwoord, of profielwijzigingen',
  },
  {
    value: 'feature_question',
    label: 'Feature vraag',
    description: 'Hoe werkt een bepaalde functie?',
  },
  {
    value: 'feature_request',
    label: 'Feature verzoek',
    description: 'Suggestie voor nieuwe functionaliteit',
  },
  {
    value: 'general',
    label: 'Algemene vraag',
    description: 'Andere vragen of feedback',
  },
];

export function SmartContactForm({
  onSubmit,
  className,
  showTitle = true,
}: SmartContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Max 5MB per file
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      // Allowed types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      return allowedTypes.includes(file.type);
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...validFiles].slice(0, 3),
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bericht is verplicht';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Bericht moet minimaal 20 tekens bevatten';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default: send to API
        const response = await fetch('/api/support/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            attachments: formData.attachments?.map(f => f.name),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit');
        }
      }

      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: '',
        attachments: [],
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitStatus === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-green-50 border border-green-200 rounded-2xl p-8 text-center',
          className
        )}
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Bericht verzonden!
        </h3>
        <p className="text-gray-600 mb-6">
          We hebben je bericht ontvangen en reageren binnen 24 uur.
          Check ook je spam folder voor ons antwoord.
        </p>
        <Button
          onClick={() => setSubmitStatus('idle')}
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          Nieuw bericht sturen
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {showTitle && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            Stuur ons een bericht
          </h3>
          <p className="text-gray-500 text-sm">
            Vul het formulier in en we reageren binnen 24 uur
          </p>
        </div>
      )}

      {/* Error Banner */}
      <AnimatePresence>
        {submitStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Er ging iets mis</p>
              <p className="text-sm text-red-600">
                Probeer het opnieuw of neem contact op via support@datingassistent.nl
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <User className="inline w-4 h-4 mr-1" />
            Naam *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Jouw naam"
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2',
              'focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500',
              'transition-all duration-200',
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Mail className="inline w-4 h-4 mr-1" />
            E-mail *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jouw@email.nl"
            className={cn(
              'w-full px-4 py-3 rounded-xl border-2',
              'focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500',
              'transition-all duration-200',
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Tag className="inline w-4 h-4 mr-1" />
          Categorie
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 border-gray-200',
            'focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500',
            'transition-all duration-200 bg-white'
          )}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label} - {cat.description}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <MessageSquare className="inline w-4 h-4 mr-1" />
          Onderwerp *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Kort omschrijving van je vraag"
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2',
            'focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500',
            'transition-all duration-200',
            errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200'
          )}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bericht *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
          placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 resize-none',
            'focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500',
            'transition-all duration-200',
            errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200'
          )}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Bijlagen (optioneel)
        </label>
        <div className="space-y-2">
          {/* File list */}
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                >
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 max-w-[150px] truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {(!formData.attachments || formData.attachments.length < 3) && (
            <label className={cn(
              'inline-flex items-center gap-2 px-4 py-2',
              'bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer',
              'text-sm text-gray-700 transition-colors'
            )}>
              <Paperclip className="w-4 h-4" />
              Bestand toevoegen
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,application/pdf"
                className="hidden"
                multiple
              />
            </label>
          )}
          <p className="text-xs text-gray-500">
            Max 3 bestanden, 5MB per bestand (JPG, PNG, GIF, PDF)
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full py-4 rounded-xl font-medium',
          'bg-gradient-to-r from-coral-500 to-purple-600',
          'hover:from-coral-600 hover:to-purple-700',
          'text-white shadow-lg hover:shadow-xl',
          'transition-all duration-200'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Versturen...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Bericht versturen
          </>
        )}
      </Button>
    </form>
  );
}
