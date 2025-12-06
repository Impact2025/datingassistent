import type {NextConfig} from 'next';

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
  // Video streaming configuration
  async headers() {
    return [
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
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
    ],
  },
};

// Temporarily disable Sentry wrapping to fix "self is not defined" error
// TODO: Re-enable after successful deployment and proper Sentry setup
// if (process.env.NODE_ENV === 'production') {
//   const { withSentryConfig } = require('@sentry/nextjs');
//   module.exports = withSentryConfig(nextConfig, {
//     silent: true,
//     org: process.env.SENTRY_ORG,
//     project: process.env.SENTRY_PROJECT,
//   });
// } else {
//   module.exports = nextConfig;
// }

export default nextConfig;
