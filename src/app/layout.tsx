import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from "@/providers/user-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { WebVitals } from "@/components/analytics/web-vitals";
import { ThemeProvider } from "@/providers/theme-provider";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { StructuredData } from "@/components/structured-data";
import ErrorBoundary from "@/components/error-boundary";

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
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#E14874" />
        <link rel="canonical" href="https://datingassistent.nl" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <GoogleAnalytics />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <StructuredData />
        <SkipLinks />
        <ErrorBoundary>
          <ThemeProvider>
            <WebVitals />
            <UserProvider>
              <div id="main-content">
                {children}
              </div>
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}