// Load filesystem patches for Docker build compatibility
try {
  require('./scripts/fs-patch');
} catch (error) {
  console.warn('Warning: Could not load fs-patch, build may fail in Docker:', error.message);
}

/** @type   {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone build for Docker deployment
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // 鐎瑰苯鍙忕粋浣烘暏閺傚洣娆㈢化鑽ょ埠閹殿偅寮?
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/C:/Users/**',
        '**/Application Data/**',
        '**/AppData/**',
        '**/ActionsMcpHost.exe',
        '**/.*',
        '**/*.sock',
        '**/dockerInference/**',
        '**/userAnalyticsOtlpHttp/**',
      ],
      poll: false,
    };

    // 缁備胶鏁ら幍鈧張澶嬫瀮娴犲墎閮寸紒鐔虹处鐎?
    config.cache = false;

    return config;
  },
}

module.exports = nextConfig
