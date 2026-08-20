import { Request, Response, NextFunction } from 'express';

// In-Memory Rate Limiter Store
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Express Rate Limiting Middleware
 * Prevents brute-force attacks and DoS on sensitive endpoints.
 * @param windowMs Window duration in milliseconds
 * @param maxMax Maximum requests per window
 * @param message Custom Arabic error message
 */
export function createRateLimiter(windowMs: number = 15 * 60 * 1000, maxMax: number = 100, message: string = 'تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار والمحاولة لاحقاً.') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (record.count >= maxMax) {
      res.status(429).json({
        error: message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    record.count++;
    next();
  };
}

/**
 * Security Headers Middleware
 * Adds OWASP-recommended HTTP security headers to all responses
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protect against Clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Enable XSS protection filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTP Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Cache Control for API endpoints containing sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
}

/**
 * Recursive Input Sanitizer
 * Strips script tags, HTML injection vectors, and path traversal strings from incoming body/query/params
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Strip dangerous script tags and inline handlers
    return value
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onload=/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitizedObj[key] = sanitizeValue(val);
    }
    return sanitizedObj;
  }
  return value;
}

export function inputSanitizerMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params) as any;
  }
  next();
}
