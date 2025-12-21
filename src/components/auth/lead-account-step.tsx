'use client';

/**
 * Lead Account Step - Minimal Friction Registration
 *
 * Collects only the essential information:
 * - First name
 * - Email
 * - Password
 *
 * Trust anchor included for privacy reassurance.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Lock, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUser } from '@/providers/user-provider';
import { useToast } from '@/hooks/use-toast';
import type { LeadAccountData } from '@/types/lead-activation.types';

const accountSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Voornaam moet minimaal 2 karakters zijn'),
  email: z
    .string()
    .email('Ongeldig e-mailadres'),
  password: z
    .string()
    .min(8, 'Wachtwoord moet minimaal 8 karakters bevatten'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface LeadAccountStepProps {
  onComplete: (data: LeadAccountData, userId: number) => void;
}

export function LeadAccountStep({ onComplete }: LeadAccountStepProps) {
  const { signup } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Create account with minimal data
      const result = await signup(data.email, data.password, data.firstName);
      const newUser = result.user;

      console.log('Account created:', newUser.id);

      // Save name to localStorage for profile setup
      if (typeof window !== 'undefined') {
        localStorage.setItem('profile_setup_name', data.firstName);
      }

      // Continue to next step without email verification
      // (We'll verify later in the flow)
      onComplete(
        {
          firstName: data.firstName,
          email: data.email,
          password: data.password,
        },
        newUser.id
      );
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.message?.includes('emailadres is al bij ons bekend')) {
        setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
      } else {
        setError(
          err.message || 'Er is een fout opgetreden. Probeer het opnieuw.'
        );
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Start Gratis
        </h1>
        <p className="text-gray-600">
          Maak je account aan en ontdek hoe je profiel scoort
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voornaam</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jouw voornaam"
                    autoComplete="given-name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mailadres</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jouw@email.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wachtwoord</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimaal 8 karakters"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Account aanmaken...
              </>
            ) : (
              <>
                Ga verder
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Trust Anchor */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Je gegevens zijn privé. Wij posten nooit iets op je socials.</span>
      </div>

      {/* Login Link */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Al een account?{' '}
        <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
          Log in
        </a>
      </div>
    </div>
  );
}
