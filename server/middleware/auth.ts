import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-factory-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  // Sign payload with ID, email, role (excluding passwordHash)
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = db.users.find(u => u.id === decoded.id && u.status === 'Active');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found or account is deactivated.'
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Invalid, tampered, or expired session token.'
    });
  }
}

export function requireRole(...allowedRoles: Array<'Admin' | 'Manager' | 'Supervisor' | 'Employee'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Record audit log for permission denial
      db.auditLogs.unshift({
        id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user: req.user.name,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'PRIVILEGE_VIOLATION_BLOCKED',
        resource: req.originalUrl,
        timestamp: new Date().toISOString(),
        result: 'Failure',
        ipAddress: req.ip || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.get('user-agent') || 'Unknown',
        details: `User with role ${req.user.role} attempted to access endpoint requiring ${allowedRoles.join(', ')}.`
      });

      return res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}.`
      });
    }

    next();
  };
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const rolePerm = db.rolePermissions.find(rp => rp.role === req.user?.role);
    if (!rolePerm || !rolePerm.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Missing required permission [${permission}].`
      });
    }

    next();
  };
}
