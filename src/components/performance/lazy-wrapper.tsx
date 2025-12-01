"use client";

import { Suspense, ComponentType, lazy } from 'react';
import { ErrorBoundary } from './error-boundary';
import { LoadingSpinner } from './loading-spinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Wrapper component for lazy-loaded components with error boundaries and loading states
 */
export function LazyWrapper({
  children,
  fallback,
  errorFallback
}: LazyWrapperProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || <LoadingSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Higher-order component for lazy loading components with performance optimizations
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrappedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback} errorFallback={errorFallback}>
        <LazyComponent {...(props as any)} />
      </LazyWrapper>
    );
  };
}

// Re-export lazy for convenience
export { lazy } from 'react';