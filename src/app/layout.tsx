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
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ConsentProvider, CookieUI } from "@/components/cookie-consent";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  metadataBase: new URL('https://datingassistent.nl'),
  title: 'DatingAssistent – AI Dating Coach voor Moderne Singles',
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
    siteName: 'DatingAssistent',
    title: 'DatingAssistent – AI Dating Coach voor Moderne Singles',
    description: 'DatingAssistent is jouw persoonlijke datingcoach: altijd beschikbaar, veilig en eerlijk advies, zodat jij sneller een echte match vindt.',
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
    title: 'DatingAssistent – AI Dating Coach voor Moderne Singles',
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
    google: '',
  },
};

// Google Analytics is now imported as a client component from @/components/analytics/google-analytics
// It will only load with user consent

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `,
          }}
        />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <StructuredData />
        <SkipLinks />
        <ScreenReaderAnnouncer />
        <ServiceWorkerErrorBoundary>
          <ServiceWorkerRegistration />
          <OfflineIndicator />
          <InstallPrompt />
          <UpdatePrompt />
        </ServiceWorkerErrorBoundary>
        <UserProvider>
          <ToastProvider>
            <PWAProvider>
              <QueryProvider>
                <ThemeProvider>
                  <ConsentProvider>
                    <div id="main-content">
                      {children}
                    </div>
                    <Toaster />
                    <SonnerToaster position="bottom-right" richColors closeButton />
                    <IrisFloatingButton />
                    <TutorialEngine />
                    <CookieUI />
                  </ConsentProvider>
                </ThemeProvider>
              </QueryProvider>
            </PWAProvider>
          </ToastProvider>
        </UserProvider>
        <WebVitals />
        <MicrosoftClarity />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
