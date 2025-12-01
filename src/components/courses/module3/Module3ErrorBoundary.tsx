'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Module3ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface Module3ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class Module3ErrorBoundary extends React.Component<
  Module3ErrorBoundaryProps,
  Module3ErrorBoundaryState
> {
  constructor(props: Module3ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Module3ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service (Sentry, etc.)
    console.error('Module 3 Error Boundary caught an error:', error, errorInfo);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <Module3ErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface Module3ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function Module3ErrorFallback({ error, resetError }: Module3ErrorFallbackProps) {
  const handleRefresh = () => {
    resetError();
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-lg border-red-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Er is iets misgegaan
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Module 3: Profieltekst die wel werkt kon niet worden geladen.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Foutdetails (ontwikkelmodus):</h4>
              <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
              </pre>
            </div>
          )}

          {/* User Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={resetError}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Probeer opnieuw
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Pagina vernieuwen
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Terug naar Dashboard
            </Button>
          </div>

          {/* Support Information */}
          <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            <p className="mb-2">
              <strong>Probleem blijft bestaan?</strong>
            </p>
            <p>
              Neem contact op met onze support via{' '}
              <a
                href="mailto:support@datingassistent.nl"
                className="text-primary hover:underline"
              >
                support@datingassistent.nl
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for functional components
export function useModule3ErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Module 3 Error:', error, errorInfo);

    // In production, send to monitoring
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  };
}