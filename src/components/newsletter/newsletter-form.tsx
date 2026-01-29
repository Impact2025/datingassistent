'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterFormProps {
  source?: string;
  className?: string;
  buttonText?: string;
  placeholder?: string;
  showIcon?: boolean;
  variant?: 'default' | 'compact' | 'inline';
}

export function NewsletterForm({
  source = 'website',
  className = '',
  buttonText = 'Abonneren',
  placeholder = 'jouw@email.nl',
  showIcon = true,
  variant = 'default',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setMessage('Vul je e-mailadres in');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Er is iets misgegaan');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Kon geen verbinding maken. Probeer het later opnieuw.');
    }
  };

  // Reset status after showing message
  const handleReset = () => {
    setStatus('idle');
    setMessage('');
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 ${className}`}
      >
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`flex ${variant === 'inline' ? 'flex-row' : 'flex-col sm:flex-row'} gap-3`}>
        <div className="relative flex-1">
          {showIcon && (
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') handleReset();
            }}
            placeholder={placeholder}
            disabled={status === 'loading'}
            className={`w-full ${showIcon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50 transition-all`}
          />
        </div>
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 whitespace-nowrap"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Even geduld...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>

      <AnimatePresence>
        {status === 'error' && message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
