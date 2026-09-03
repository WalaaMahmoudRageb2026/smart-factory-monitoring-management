import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { AuthenticatedRequest } from './auth';

// Rate Limiting In-Memory Store
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

export function rateLimiter(limit = 120, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimits.get(ip);

    if (!record || now > record.resetTime) {
      rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > limit) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Rate limit exceeded. Please try again later.'
      });
    }

    next();
  };
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // OWASP Recommended Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
}

export function logAudit(
  req: AuthenticatedRequest,
  action: string,
  resource: string,
  result: 'Success' | 'Failure' | 'Warning',
  details?: string
) {
  const user = req.user;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.get('user-agent') || 'Browser Client';

  db.auditLogs.unshift({
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user: user ? user.name : 'Unauthenticated',
    userEmail: user ? user.email : 'N/A',
    userRole: user ? user.role : 'Anonymous',
    action,
    resource,
    timestamp: new Date().toISOString(),
    result,
    ipAddress: ip,
    userAgent,
    details
  });

  // Limit audit logs list to 1000 records in memory
  if (db.auditLogs.length > 1000) {
    db.auditLogs = db.auditLogs.slice(0, 1000);
  }
}
