"use client";

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, LogOut, Wifi } from 'lucide-react';
import { getAuthErrorMessage, useAuthManager } from '@/lib/auth-manager';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
  isAuthError: boolean;
  isNetworkError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private authManager = useAuthManager();

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: '',
      isAuthError: false,
      isNetworkError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if it's an authentication error
    const isAuthError = error.message.includes('Authentication failed') ||
                       error.message.includes('AUTH_FALLBACK_MODE') ||
                       error.message.includes('Token refresh failed') ||
                       error.message === 'Unauthorized';

    // Check if it's a network error
    const isNetworkError = error.message.includes('Network') ||
                          error.message.includes('fetch') ||
                          error.name === 'TypeError';

    return {
      hasError: true,
      error,
      isAuthError,
      isNetworkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      errorInfo: errorInfo.componentStack || '',
    });

    // Log to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          component: 'AuthErrorBoundary',
          isAuthError: this.state.isAuthError,
          isNetworkError: this.state.isNetworkError,
        },
      });
    }
  }

  handleRetry = () => {
    // Clear error state and retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: '',
      isAuthError: false,
      isNetworkError: false,
    });
  };

  handleLogout = () => {
    // Clear authentication and redirect to login
    this.authManager.clearAuth();
    window.location.href = '/login';
  };

  handleRefresh = () => {
    // Refresh the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, isAuthError, isNetworkError } = this.state;
      const errorMessage = error ? getAuthErrorMessage(error) : 'Er is een onverwachte fout opgetreden.';

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                {isNetworkError ? (
                  <Wifi className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <CardTitle className="text-xl text-foreground">
                {isNetworkError ? 'Netwerk Probleem' : 'Authenticatie Probleem'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-center">
                {errorMessage}
              </p>

              {isAuthError && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Mogelijke oplossingen:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Log opnieuw in</li>
                    <li>• Controleer je internetverbinding</li>
                    <li>• Wis browser cache indien nodig</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Opnieuw Proberen
                </Button>

                {isAuthError && (
                  <Button
                    onClick={this.handleLogout}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Uitloggen & Opnieuw Inloggen
                  </Button>
                )}

                <Button
                  onClick={this.handleRefresh}
                  variant="ghost"
                  className="w-full"
                >
                  Pagina Vernieuwen
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    Debug Informatie
                  </summary>
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for handling auth errors in components
 */
export function useAuthErrorHandler() {
  const authManager = useAuthManager();

  const handleAuthError = (error: Error) => {
    const message = getAuthErrorMessage(error);

    // Show user-friendly error message
    if (typeof window !== 'undefined') {
      // You could use a toast notification here
      alert(message);
    }

    // Log error for monitoring
    console.error('Auth error handled:', error);

    // If it's a critical auth error, redirect to login
    if (error.message.includes('Authentication failed') ||
        error.message === 'Unauthorized') {
      setTimeout(() => {
        authManager.clearAuth();
        window.location.href = '/login';
      }, 2000);
    }
  };

  return { handleAuthError };
}