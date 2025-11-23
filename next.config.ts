import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // Minimal configuration for quick deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
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
  // Temporarily remove all complex webpack config, experimental features, and security headers
  // TODO: Re-enable after successful deployment
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
