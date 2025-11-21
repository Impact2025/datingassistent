import dynamic from 'next/dynamic';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy loading utility with error boundary and loading state
export function lazyLoad(importFunc: () => Promise<any>, ssr = false) {
  return dynamic(importFunc, {
    loading: LoadingSpinner,
    ssr,
  });
}

// Preload utility for critical components
export function preloadComponent(importFunc: () => Promise<any>) {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 1);

  schedulePreload(() => {
    importFunc().catch(() => {
      // Ignore preload errors
    });
  });
}

// Lazy loaded components - only for components that exist
export const LazyChatbot = lazyLoad(() =>
  import('@/components/chatbot/whatsapp-widget')
);

export const LazySlideViewer = lazyLoad(() =>
  import('@/components/slides/slide-viewer')
);

export const LazyDatabaseSlidesViewer = lazyLoad(() =>
  import('@/components/slides/database-slides-viewer')
);

// Dynamic imports for pages (Next.js automatic code splitting)
export const dynamicPage = (importFunc: () => Promise<any>) =>
  dynamic(importFunc, {
    loading: LoadingSpinner,
    ssr: true, // Keep SSR for pages
  });

// Preload critical components on app start
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be used soon
    preloadComponent(() => import('@/components/ui/button'));
    preloadComponent(() => import('@/components/ui/input'));
    preloadComponent(() => import('@/components/ui/card'));
  }
}