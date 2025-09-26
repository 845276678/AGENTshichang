const fs = require('fs');
const originalReadFileSync = fs.readFileSync;
const originalStatSync = fs.statSync;
const originalReaddirSync = fs.readdirSync;
const originalOpendirSync = fs.opendirSync;
const fsPromises = fs.promises;
const originalReaddir = fsPromises?.readdir?.bind(fsPromises);
const originalOpendir = fsPromises?.opendir?.bind(fsPromises);

fs.readFileSync = function (...args) {
  try {
    return originalReadFileSync.apply(this, args);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      return '';
    }
    throw error;
  }
};

fs.statSync = function (...args) {
  try {
    return originalStatSync.apply(this, args);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      return { isDirectory: () => false, isFile: () => false };
    }
    throw error;
  }
};

fs.readdirSync = function (...args) {
  try {
    return originalReaddirSync.apply(this, args);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      return [];
    }
    throw error;
  }
};

fs.opendirSync = function (...args) {
  try {
    return originalOpendirSync.apply(this, args);
  } catch (error) {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      return { readSync: () => null, closeSync: () => {} };
    }
    throw error;
  }
};

if (originalReaddir) {
  fsPromises.readdir = async function (...args) {
    try {
      return await originalReaddir(...args);
    } catch (error) {
      if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
        return [];
      }
      throw error;
    }
  };
}

if (originalOpendir) {
  fsPromises.opendir = async function (...args) {
    try {
      return await originalOpendir(...args);
    } catch (error) {
      if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
        return {
          async read() { return null; },
          async close() { return undefined; }
        };
      }
      throw error;
    }
  };
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
      ],
      poll: false,
    };

    // 缁備胶鏁ら幍鈧張澶嬫瀮娴犲墎閮寸紒鐔虹处鐎?
    config.cache = false;

    // 闁插秴鍟撻弬鍥︽缁崵绮哄Ο鈥虫健
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

