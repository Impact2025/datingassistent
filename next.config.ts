import type {NextConfig} from 'next';
import withSerwistInit from "@serwist/next";

// Serwist PWA Configuration
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Redirects for URL corrections
  async redirects() {
    return [
      {
        source: '/emotionele-ready',
        destination: '/emotionele-readiness',
        permanent: true,
      },
      {
        source: '/zelfbeeld',
        destination: '/profiel',
        permanent: true,
      },
      {
        source: '/dating-archetypes',
        destination: '/dating-style',
        permanent: true,
      },
      // Common variations users might expect
      {
        source: '/profile',
        destination: '/profiel',
        permanent: true,
      },
      {
        source: '/dating-styles',
        destination: '/dating-style',
        permanent: true,
      },
      {
        source: '/emotional-readiness',
        destination: '/emotionele-readiness',
        permanent: true,
      },
      {
        source: '/self-image',
        destination: '/profiel',
        permanent: true,
      },
      // Standalone tools - no redirects needed since pages exist
      {
        source: '/levensvisie',
        destination: '/waarden-kompas',
        permanent: true,
      },
    ];
  },

  // Minimal configuration for quick deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // WORLD-CLASS: Security headers + streaming configuration
  async headers() {
    return [
      {
        // Apply enterprise-grade security headers to ALL routes
        source: '/(.*)',
        headers: [
          // Content Security Policy (CSP) - Cloudflare Turnstile + Analytics enabled
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cdn.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https: wss:; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
              : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss: http://localhost:*; frame-src 'self' https:; media-src 'self' https: blob:;"
          },
          // HTTP Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          // X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        // Video files - enable streaming and caching
        source: '/videos/:path*',
        headers: [
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // MP4 videos
        source: '/videos/:path*.mp4',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
        ],
      },
      {
        // WebM videos
        source: '/videos/:path*.webm',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/webm',
          },
        ],
      },
    ];
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Performance optimizations
  compiler: {
    // Temporarily disabled for debugging Turnstile
    // removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // Vercel Blob Storage for blog images
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

// Sentry integration for error tracking
const sentryConfig = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
};

// Apply Serwist PWA wrapper
let finalConfig = withSerwist(nextConfig);

// Only wrap with Sentry in production if DSN is configured
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  const { withSentryConfig } = require('@sentry/nextjs');
  finalConfig = withSentryConfig(finalConfig, sentryConfig);
}

export default finalConfig;
