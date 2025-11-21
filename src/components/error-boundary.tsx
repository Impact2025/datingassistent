'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
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

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Er is iets misgegaan
        </h2>
        <p className="text-gray-600 mb-6">
          Er is een onverwachte fout opgetreden. Onze ontwikkelaars zijn op de hoogte gebracht.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left bg-gray-100 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700">
              Foutdetails (alleen zichtbaar in ontwikkelmodus)
            </summary>
            <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="space-y-2">
          <Button onClick={resetError} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Probeer opnieuw
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Ga naar homepagina
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack,
        },
      },
    });
  };
}

export default ErrorBoundary;