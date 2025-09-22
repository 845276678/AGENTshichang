# 安全性和性能优化实施指南

## 一、立即需要修复的安全代码

### 1. JWT签名验证修复

创建新文件 `src/lib/jwt-secure.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

export function generateSecureTokenPair(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    {
      expiresIn: '15m',
      algorithm: 'HS256',
      issuer: 'ai-marketplace',
      audience: 'ai-marketplace-users'
    }
  );

  const refreshToken = jwt.sign(
    { userId, email, role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS256',
      issuer: 'ai-marketplace',
      audience: 'ai-marketplace-users'
    }
  );

  return { accessToken, refreshToken };
}

export function verifySecureToken(token: string, isRefreshToken = false): TokenPayload {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'ai-marketplace',
      audience: 'ai-marketplace-users'
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('INVALID_TOKEN');
    }
    throw error;
  }
}
```

### 2. CSRF保护实现

创建新文件 `src/lib/csrf.ts`:

```typescript
import crypto from 'crypto';
import { cookies } from 'next/headers';

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCSRFToken(): string {
  const token = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(crypto.randomBytes(32))
    .digest('hex');

  return token;
}

export function setCSRFCookie(token: string) {
  cookies().set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  });
}

export function verifyCSRFToken(request: Request): boolean {
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

// Middleware helper
export async function withCSRFProtection(request: Request, handler: Function) {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    if (!verifyCSRFToken(request)) {
      return new Response('Invalid CSRF token', { status: 403 });
    }
  }

  return handler(request);
}
```

### 3. XSS防护增强

创建新文件 `src/lib/xss-protection.ts`:

```typescript
import DOMPurify from 'isomorphic-dompurify';

// HTML清理配置
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORCE_BODY: true,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  IN_PLACE: false
};

export function sanitizeHTML(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, PURIFY_CONFIG);
}

export function sanitizeJSON(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeJSON(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeJSON(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

// SQL注入防护（额外层）
export function sanitizeSQLInput(input: string): string {
  if (!input) return '';

  // 移除或转义危险字符
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .replace(/0x/gi, '')
    .trim();
}
```

### 4. 文件上传安全

创建新文件 `src/lib/file-upload-security.ts`:

```typescript
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';

const ALLOWED_MIME_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/json': ['.json']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 文件签名（魔术字节）
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
};

export class FileUploadValidator {
  static async validateFile(file: File | Buffer, mimeType: string, fileName: string) {
    // 1. 检查MIME类型
    if (!ALLOWED_MIME_TYPES[mimeType]) {
      throw new Error('File type not allowed');
    }

    // 2. 检查文件扩展名
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_MIME_TYPES[mimeType].includes(ext)) {
      throw new Error('File extension does not match MIME type');
    }

    // 3. 检查文件大小
    const size = file instanceof File ? file.size : file.length;
    if (size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 4. 验证文件签名（魔术字节）
    if (FILE_SIGNATURES[mimeType]) {
      const buffer = file instanceof File ?
        Buffer.from(await file.arrayBuffer()) : file;

      const signature = FILE_SIGNATURES[mimeType];
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          throw new Error('File content does not match declared type');
        }
      }
    }

    return true;
  }

  static sanitizeFileName(fileName: string): string {
    // 移除路径遍历字符
    let sanitized = fileName.replace(/\.\./g, '').replace(/[\/\\]/g, '');

    // 只保留安全字符
    sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 添加时间戳防止冲突
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(sanitized);
    const name = path.basename(sanitized, ext);

    return `${name}_${timestamp}_${randomStr}${ext}`;
  }

  static async scanForVirus(filePath: string): Promise<boolean> {
    // 集成病毒扫描API（如ClamAV）
    // 这里是占位符实现
    try {
      // const result = await clamav.scanFile(filePath);
      // return result.isClean;
      return true; // 临时返回true，实际应调用病毒扫描
    } catch (error) {
      console.error('Virus scan failed:', error);
      return false;
    }
  }
}
```

## 二、性能优化代码

### 1. Redis缓存层实现

创建新文件 `src/lib/cache.ts`:

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

export class CacheService {
  private static DEFAULT_TTL = 3600; // 1小时

  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl = this.DEFAULT_TTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  // 缓存装饰器
  static cacheable(keyPrefix: string, ttl = this.DEFAULT_TTL) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;

        // 尝试从缓存获取
        const cached = await CacheService.get(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // 执行原方法
        const result = await originalMethod.apply(this, args);

        // 存入缓存
        await CacheService.set(cacheKey, result, ttl);

        return result;
      };

      return descriptor;
    };
  }
}
```

### 2. 数据库查询优化

创建新文件 `src/lib/db-optimization.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

// 单例模式的Prisma客户端
class OptimizedPrismaClient {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
        errorFormat: 'minimal'
      });

      // 连接池配置
      this.instance.$connect();
    }

    return this.instance;
  }

  // 批量查询优化
  static async batchQuery<T>(queries: Promise<T>[]): Promise<T[]> {
    return Promise.all(queries);
  }

  // 带缓存的查询
  static async cachedFindUnique(
    model: any,
    where: any,
    cacheKey: string,
    ttl = 300
  ) {
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const result = await model.findUnique({ where });
    if (result) {
      await CacheService.set(cacheKey, result, ttl);
    }

    return result;
  }

  // 分页查询优化
  static async paginatedQuery(
    model: any,
    page = 1,
    limit = 20,
    where = {},
    orderBy = { createdAt: 'desc' }
  ) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      model.count({ where })
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export const prismaOptimized = OptimizedPrismaClient.getInstance();
export { OptimizedPrismaClient };
```

### 3. API响应压缩和优化

创建新文件 `src/lib/api-optimization.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

export class APIOptimizer {
  // 响应压缩
  static async compressResponse(
    data: any,
    request: NextRequest
  ): Promise<NextResponse> {
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const jsonString = JSON.stringify(data);

    // Brotli压缩（最优）
    if (acceptEncoding.includes('br')) {
      const compressed = await brotli(jsonString);
      return new NextResponse(compressed, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'br'
        }
      });
    }

    // Gzip压缩
    if (acceptEncoding.includes('gzip')) {
      const compressed = await gzip(jsonString);
      return new NextResponse(compressed, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip'
        }
      });
    }

    // 无压缩
    return NextResponse.json(data);
  }

  // ETag支持
  static generateETag(data: any): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  // 条件请求处理
  static handleConditionalRequest(
    request: NextRequest,
    data: any
  ): NextResponse | null {
    const etag = this.generateETag(data);
    const ifNoneMatch = request.headers.get('if-none-match');

    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return null;
  }

  // API响应缓存装饰器
  static cacheable(ttl = 300) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (request: NextRequest) {
        const cacheKey = `api:${request.url}`;

        // 检查缓存
        const cached = await CacheService.get(cacheKey);
        if (cached) {
          // 处理条件请求
          const conditionalResponse = APIOptimizer.handleConditionalRequest(
            request,
            cached
          );
          if (conditionalResponse) return conditionalResponse;

          return APIOptimizer.compressResponse(cached, request);
        }

        // 执行原方法
        const result = await originalMethod.call(this, request);

        // 缓存结果
        if (result.ok) {
          const data = await result.json();
          await CacheService.set(cacheKey, data, ttl);
        }

        return result;
      };

      return descriptor;
    };
  }
}
```

## 三、安全中间件增强

更新 `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySecureToken } from '@/lib/jwt-secure';
import { verifyCSRFToken } from '@/lib/csrf';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. 安全头设置
  const response = NextResponse.next();

  // 增强的安全头
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS（仅生产环境）
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    );
  }

  // CSP配置
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.example.com"
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // 2. CSRF验证（仅限写操作）
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    if (path.startsWith('/api/') && !path.includes('/auth/')) {
      if (!verifyCSRFToken(request)) {
        return NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
      }
    }
  }

  // 3. JWT验证（保护路由）
  const protectedPaths = ['/dashboard', '/admin', '/api/protected'];
  const isProtected = protectedPaths.some(p => path.startsWith(p));

  if (isProtected) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const payload = verifySecureToken(token);
      response.headers.set('X-User-ID', payload.userId);
      response.headers.set('X-User-Role', payload.role);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 四、环境变量安全配置

创建 `.env.production.encrypted`:

```bash
# 使用加密工具加密敏感数据
# 示例：使用openssl加密
# echo "your-secret" | openssl enc -aes-256-cbc -a -salt -pass pass:yourpassword

# 加密后的数据库URL
DATABASE_URL_ENCRYPTED=U2FsdGVkX1+...

# 加密后的JWT密钥
JWT_SECRET_ENCRYPTED=U2FsdGVkX1+...

# 加密后的API密钥
API_KEYS_ENCRYPTED=U2FsdGVkX1+...
```

创建解密工具 `src/lib/env-decrypt.ts`:

```typescript
import crypto from 'crypto';

export function decryptEnvVariable(encrypted: string, password: string): string {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', password);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt environment variable');
    throw error;
  }
}

// 在应用启动时解密
export function loadSecureEnv() {
  const password = process.env.ENCRYPTION_PASSWORD;
  if (!password) {
    throw new Error('ENCRYPTION_PASSWORD not set');
  }

  // 解密敏感环境变量
  if (process.env.DATABASE_URL_ENCRYPTED) {
    process.env.DATABASE_URL = decryptEnvVariable(
      process.env.DATABASE_URL_ENCRYPTED,
      password
    );
  }

  if (process.env.JWT_SECRET_ENCRYPTED) {
    process.env.JWT_SECRET = decryptEnvVariable(
      process.env.JWT_SECRET_ENCRYPTED,
      password
    );
  }
}
```

## 五、监控和日志安全

创建 `src/lib/secure-logger.ts`:

```typescript
import winston from 'winston';

// 敏感数据模式
const SENSITIVE_PATTERNS = [
  /password["\s]*[:=]["\s]*["']?[\w\S]+["']?/gi,
  /token["\s]*[:=]["\s]*["']?[\w\S]+["']?/gi,
  /api[_-]?key["\s]*[:=]["\s]*["']?[\w\S]+["']?/gi,
  /secret["\s]*[:=]["\s]*["']?[\w\S]+["']?/gi,
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // 信用卡
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // 邮箱
];

// 日志脱敏
function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    let sanitized = data;
    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });
    return sanitized;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // 检查敏感键名
        if (/password|token|secret|key|credit|ssn/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeLogData(data[key]);
        }
      }
    }
    return sanitized;
  }

  return data;
}

// 配置Winston日志
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const sanitizedMeta = sanitizeLogData(meta);
      return JSON.stringify({
        timestamp,
        level,
        message: sanitizeLogData(message),
        ...sanitizedMeta
      });
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## 六、部署安全脚本

创建 `scripts/security-check.sh`:

```bash
#!/bin/bash

echo "Running Security Checks..."

# 1. 依赖漏洞扫描
echo "Checking npm dependencies..."
npm audit --audit-level=moderate

# 2. 代码安全扫描
echo "Running ESLint security checks..."
npx eslint . --ext .ts,.tsx,.js,.jsx --plugin security

# 3. 密钥泄露检查
echo "Checking for exposed secrets..."
npx secretlint "**/*"

# 4. Docker镜像扫描
echo "Scanning Docker image..."
docker scan ai-marketplace:latest

# 5. OWASP依赖检查
echo "Running OWASP dependency check..."
npx owasp-dependency-check --project "AI Marketplace" --scan .

# 6. 检查文件权限
echo "Checking file permissions..."
find . -type f -perm /111 -ls | grep -v node_modules

# 7. 检查环境变量
echo "Checking environment variables..."
if grep -r "DATABASE_URL\|JWT_SECRET\|API_KEY" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" . | grep -v ".env"; then
  echo "WARNING: Hardcoded secrets found!"
  exit 1
fi

echo "Security checks completed!"
```

## 七、性能监控配置

创建 `src/lib/performance-monitor.ts`:

```typescript
export class PerformanceMonitor {
  private static metrics = new Map<string, any>();

  static startTimer(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  static recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }

    const metric = this.metrics.get(label);
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.avg = metric.total / metric.count;
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  static resetMetrics() {
    this.metrics.clear();
  }

  // API性能追踪装饰器
  static track(label?: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      const metricLabel = label || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function (...args: any[]) {
        const stopTimer = PerformanceMonitor.startTimer(metricLabel);

        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } finally {
          stopTimer();
        }
      };

      return descriptor;
    };
  }
}
```

这个实施指南提供了具体的代码实现，可以立即应用到项目中以提升安全性和性能。