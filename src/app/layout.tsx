import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/providers/user-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { WebVitals } from "@/components/analytics/web-vitals";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { ScreenReaderAnnouncer } from "@/components/accessibility/screen-reader-announcer";
import { StructuredData } from "@/components/structured-data";
import ErrorBoundary from "@/components/error-boundary";
import { ServiceWorkerRegistration, ServiceWorkerErrorBoundary, InstallPrompt, UpdatePrompt, OfflineIndicator } from "@/components/pwa";
import { PWAProvider } from "@/stores/pwa-store";
import { IrisFloatingButton } from "@/components/iris/IrisFloatingButton";
import { TutorialEngine } from "@/components/onboarding/tutorial-engine/tutorial-engine";
import { ToastProvider as AchievementToastProvider } from "@/components/notifications/toast-container";
import { MicrosoftClarity } from "@/components/analytics/microsoft-clarity";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL('https://datingassistent.nl'),
  title: {
    default: 'DatingAssistent – Jouw Virtuele DatingCoach',
    template: '%s | DatingAssistent'
  },
  description: 'DatingAssistent is jouw persoonlijke datingcoach: altijd beschikbaar, veilig en eerlijk advies, zodat jij sneller een echte match vindt.',
  keywords: ['dating coach', 'AI dating', 'online daten', 'dating tips', 'dating profiel', 'dating app', 'relatiecoach', 'dating hulp'],
  authors: [{ name: 'DatingAssistent' }],
  creator: 'DatingAssistent',
  publisher: 'DatingAssistent',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://datingassistent.nl',
    title: 'DatingAssistent – Jouw Virtuele DatingCoach',
    description: 'DatingAssistent is jouw persoonlijke datingcoach: altijd beschikbaar, veilig en eerlijk advies, zodat jij sneller een echte match vindt.',
    siteName: 'DatingAssistent',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DatingAssistent - AI Dating Coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DatingAssistent – Jouw Virtuele DatingCoach',
    description: 'AI dating coaching met profiel analyse, chat coach en date planner. 89% meer matches gegarandeerd. Gratis proberen - professionele dating hulp voor singles.',
    images: ['/og-image.png'],
    creator: '@datingassistent',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://datingassistent.nl',
  },
};

// Google Analytics component
function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_PROPERTY_ID || 'G-CLGV5SLPFW';

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              custom_map: {
                dimension1: 'metric_id',
                metric1: 'metric_value',
                metric2: 'metric_delta'
              }
            });
          `,
        }}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        {/* Theme initialization script - runs BEFORE React hydration to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = theme === 'dark' || (theme === 'system' && systemDark) || (!theme && systemDark);
                  document.documentElement.classList.add(isDark ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#FF7B54" />
        {/* CSS Loading Fallback - DISABLED to debug ERR_FAILED */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DatingAssistent Pro" />
        <meta name="description" content="Je persoonlijke AI dating coach voor betere matches en dates" />
        <meta name="keywords" content="dating, AI coach, matches, dates, relaties, profiel" />
        <meta name="author" content="DatingAssistent" />

        {/* PWA Icons - World-Class */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#FF7B54" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />

        <link rel="canonical" href="https://datingassistent.nl" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preload LCP image - video poster for hero section */}
        <link rel="preload" as="image" href="/images/iris-video-poster.jpg" />

        <GoogleAnalytics />
      </head>
      <body className="font-body bg-background text-foreground antialiased" suppressHydrationWarning>
        <MicrosoftClarity />
        <StructuredData />
        <SkipLinks />
        <ScreenReaderAnnouncer />
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <PWAProvider>
                <WebVitals />
                {/* SW components wrapped in error boundary for graceful degradation */}
                <ServiceWorkerErrorBoundary>
                  <ServiceWorkerRegistration />
                  <OfflineIndicator />
                  <UpdatePrompt />
                </ServiceWorkerErrorBoundary>
                <UserProvider>
                  <AchievementToastProvider>
                    <TutorialEngine>
                      <div id="main-content">
                        {children}
                      </div>
                      <Toaster />
                      <SonnerToaster position="bottom-right" richColors closeButton />
                      <IrisFloatingButton />
                      <InstallPrompt />
                    </TutorialEngine>
                  </AchievementToastProvider>
                </UserProvider>
              </PWAProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}