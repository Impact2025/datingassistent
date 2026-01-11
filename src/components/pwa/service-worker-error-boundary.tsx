'use client';

import { Component, ReactNode } from 'react';
import { reportSWError } from '@/lib/client-error-reporter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary specifically for Service Worker related components
 * Catches errors during SW registration and provides graceful degradation
 */
export class ServiceWorkerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Report SW errors to monitoring
    reportSWError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ServiceWorkerErrorBoundary'
    });

    console.error('[SW ErrorBoundary] Caught error:', error);
    console.error('[SW ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Return fallback or nothing - don't crash the whole app
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Silent failure - SW is optional, app should still work
      return null;
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap any component with SW error boundary
 */
export function withSWErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithSWErrorBoundaryComponent(props: P) {
    return (
      <ServiceWorkerErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ServiceWorkerErrorBoundary>
    );
  };
}
