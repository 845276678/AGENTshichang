/** @type {import('next').NextConfig} */
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

    // 完全禁用文件系统扫描
    config.watchOptions = {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/C:/Users/**',
        '**/Application Data/**',
        '**/AppData/**',
        '**/ActionsMcpHost.exe',
        '**/.*',
      ],
      poll: false,
    };

    // 禁用所有文件系统缓存
    config.cache = false;
    config.snapshot = false;

    // 重写文件系统模块
    const originalReadFileSync = require('fs').readFileSync;
    const originalStatSync = require('fs').statSync;
    const originalReaddirSync = require('fs').readdirSync;

    require('fs').readFileSync = function(...args) {
      try {
        return originalReadFileSync.apply(this, args);
      } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
          return '';
        }
        throw e;
      }
    };

    require('fs').statSync = function(...args) {
      try {
        return originalStatSync.apply(this, args);
      } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
          return { isDirectory: () => false, isFile: () => false };
        }
        throw e;
      }
    };

    require('fs').readdirSync = function(...args) {
      try {
        return originalReaddirSync.apply(this, args);
      } catch (e) {
        if (e.code === 'EPERM' || e.code === 'EACCES') {
          return [];
        }
        throw e;
      }
    };

    return config;
  },
}

module.exports = nextConfig
