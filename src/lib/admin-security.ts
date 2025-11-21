/**
 * ADMIN SECURITY MIDDLEWARE
 * Enterprise-grade security for admin endpoints
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/admin-audit';

// Rate limiting store (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting
  maxRequestsPerMinute: 30,
  maxRequestsPerHour: 200,
  blockDurationMinutes: 15,

  // Suspicious patterns
  suspiciousKeywords: [
    'script',
    'javascript:',
    'onload',
    'onerror',
    'eval',
    'function',
    'alert',
    'document.cookie',
    'localStorage',
    'sessionStorage'
  ],

  // SQL injection patterns (simplified)
  sqlInjectionPatterns: [
    /\bUNION\b/i,
    /\bSELECT\b/i,
    /\bINSERT\b/i,
    /\bUPDATE\b/i,
    /\bDELETE\b/i,
    /\bDROP\b/i,
    /\bCREATE\b/i,
    /\bALTER\b/i
  ]
};

/**
 * Check if request should be rate limited
 */
function checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number; blockedUntil?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Check if currently blocked
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      blockedUntil: entry.blockedUntil
    };
  }

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentEntry = rateLimitStore.get(identifier) || {
    count: 0,
    resetTime: now + 60000 // 1 minute
  };

  // Check hourly limit (sliding window)
  if (currentEntry.count >= SECURITY_CONFIG.maxRequestsPerHour) {
    const blockedUntil = now + (SECURITY_CONFIG.blockDurationMinutes * 60 * 1000);
    rateLimitStore.set(identifier, {
      ...currentEntry,
      blockedUntil
    });

    return {
      allowed: false,
      blockedUntil
    };
  }

  // Check per-minute limit
  if (currentEntry.count >= SECURITY_CONFIG.maxRequestsPerMinute) {
    return {
      allowed: false,
      resetTime: currentEntry.resetTime
    };
  }

  // Update counter
  currentEntry.count++;
  rateLimitStore.set(identifier, currentEntry);

  return { allowed: true };
}

/**
 * Detect suspicious input patterns
 */
function detectSuspiciousInput(input: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for suspicious keywords
  for (const keyword of SECURITY_CONFIG.suspiciousKeywords) {
    if (input.toLowerCase().includes(keyword.toLowerCase())) {
      reasons.push(`Suspicious keyword: ${keyword}`);
    }
  }

  // Check for SQL injection patterns
  for (const pattern of SECURITY_CONFIG.sqlInjectionPatterns) {
    if (typeof pattern === 'object' && pattern.test && pattern.test(input)) {
      reasons.push('Potential SQL injection pattern detected');
    }
  }

  // Check for extremely long inputs (potential DoS)
  if (input.length > 10000) {
    reasons.push('Input too long (potential DoS attack)');
  }

  // Check for high entropy (potential encoded attacks)
  const entropy = calculateShannonEntropy(input);
  if (entropy > 5.0 && input.length > 100) {
    reasons.push('High entropy content (potential encoded attack)');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Calculate Shannon entropy of a string
 */
function calculateShannonEntropy(str: string): number {
  const charCount = new Map<string, number>();

  for (const char of str) {
    charCount.set(char, (charCount.get(char) || 0) + 1);
  }

  let entropy = 0;
  const len = str.length;

  for (const count of charCount.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: Request): string {
  // Use IP + User Agent for identification
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const ip = forwarded?.split(',')[0]?.trim() ||
             realIP ||
             cfIP ||
             'unknown';

  return `${ip}:${userAgent.slice(0, 50)}`; // Limit UA length
}

/**
 * Comprehensive admin security middleware
 */
export async function adminSecurityMiddleware(
  request: NextRequest,
  options: {
    enableRateLimiting?: boolean;
    enableInputValidation?: boolean;
    enableAuditLogging?: boolean;
    strictMode?: boolean;
  } = {}
): Promise<{ allowed: boolean; response?: NextResponse; adminUser?: any }> {
  const {
    enableRateLimiting = true,
    enableInputValidation = true,
    enableAuditLogging = true,
    strictMode = false
  } = options;

  try {
    // 1. Rate limiting check
    if (enableRateLimiting) {
      const clientId = getClientIdentifier(request);
      const rateLimitResult = checkRateLimit(clientId);

      if (!rateLimitResult.allowed) {
        console.warn(`🚫 Rate limit exceeded for ${clientId}`);

        if (enableAuditLogging) {
          // Try to log even without admin user (will fail gracefully)
          try {
            await logAdminAction(-1, 'RATE_LIMIT_EXCEEDED', 'admin_security', false, {
              clientId,
              blockedUntil: rateLimitResult.blockedUntil,
              resetTime: rateLimitResult.resetTime
            });
          } catch (logError) {
            // Ignore audit logging errors for rate limited requests
          }
        }

        const errorMessage = rateLimitResult.blockedUntil
          ? `Too many requests. Blocked until ${new Date(rateLimitResult.blockedUntil).toISOString()}`
          : `Too many requests. Try again at ${new Date(rateLimitResult.resetTime!).toISOString()}`;

        return {
          allowed: false,
          response: NextResponse.json(
            { error: errorMessage },
            {
              status: 429,
              headers: {
                'Retry-After': rateLimitResult.resetTime
                  ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
                  : '60'
              }
            }
          )
        };
      }
    }

    // 2. Admin authentication
    let adminUser;
    try {
      adminUser = await requireAdmin(request);
    } catch (authError) {
      if (enableAuditLogging) {
        const clientId = getClientIdentifier(request);
        await logAdminAction(-1, 'ADMIN_AUTH_FAILED', 'admin_security', false, {
          clientId,
          error: authError instanceof Error ? authError.message : 'Unknown auth error',
          path: request.nextUrl.pathname,
          method: request.method
        });
      }

      return {
        allowed: false,
        response: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      };
    }

    // 3. Input validation (for POST/PUT/PATCH requests)
    if (enableInputValidation && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.clone().json(); // Clone to avoid consuming the stream

        // Recursively check all string inputs
        const suspiciousInputs = findSuspiciousInputs(body);

        if (suspiciousInputs.length > 0) {
          console.warn(`🚨 Suspicious input detected for admin ${adminUser.id}:`, suspiciousInputs);

          if (enableAuditLogging) {
            await logAdminAction(adminUser.id, 'SUSPICIOUS_INPUT_DETECTED', 'admin_security', false, {
              suspiciousInputs: suspiciousInputs.map(s => ({
                field: s.field,
                reasons: s.reasons
              })),
              path: request.nextUrl.pathname,
              method: request.method
            });
          }

          if (strictMode) {
            return {
              allowed: false,
              response: NextResponse.json(
                { error: 'Suspicious input detected' },
                { status: 400 }
              )
            };
          }
          // In non-strict mode, just log the warning
        }
      } catch (parseError) {
        // If body parsing fails, continue (might be non-JSON request)
      }
    }

    // 4. Log successful access
    if (enableAuditLogging) {
      await logAdminAction(adminUser.id, 'ADMIN_ACCESS_GRANTED', 'admin_security', true, {
        path: request.nextUrl.pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      });
    }

    return {
      allowed: true,
      adminUser
    };

  } catch (error) {
    console.error('Admin security middleware error:', error);

    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Security check failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Recursively find suspicious inputs in request body
 */
function findSuspiciousInputs(obj: any, path: string = ''): Array<{ field: string; reasons: string[] }> {
  const suspicious: Array<{ field: string; reasons: string[] }> = [];

  if (typeof obj === 'string') {
    const result = detectSuspiciousInput(obj);
    if (result.suspicious) {
      suspicious.push({
        field: path,
        reasons: result.reasons
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      suspicious.push(...findSuspiciousInputs(item, `${path}[${index}]`));
    });
  } else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      suspicious.push(...findSuspiciousInputs(value, path ? `${path}.${key}` : key));
    }
  }

  return suspicious;
}

/**
 * Clean up expired rate limit entries (call this periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime || (entry.blockedUntil && now > entry.blockedUntil)) {
      rateLimitStore.delete(key);
    }
  }
}

// Periodic cleanup (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

// ============================================================================
// UTILITY FUNCTIONS FOR ADMIN OPERATIONS
// ============================================================================

/**
 * Validate admin operation permissions
 */
export function validateAdminPermissions(
  adminUser: any,
  operation: string,
  resource: string
): { allowed: boolean; reason?: string } {
  // Super admin check
  if (adminUser.role === 'super_admin') {
    return { allowed: true };
  }

  // Define permission matrix
  const permissions: Record<string, Record<string, string[]>> = {
    admin: {
      users: ['read', 'create', 'update'],
      content: ['read', 'create', 'update', 'delete'],
      analytics: ['read'],
      system: ['read']
    },
    coach: {
      users: ['read'],
      content: ['read', 'create', 'update'],
      analytics: ['read'],
      system: []
    }
  };

  const userPermissions = permissions[adminUser.role] || {};
  const resourcePermissions = userPermissions[resource] || [];

  if (!resourcePermissions.includes(operation)) {
    return {
      allowed: false,
      reason: `Insufficient permissions: ${adminUser.role} cannot ${operation} ${resource}`
    };
  }

  return { allowed: true };
}

/**
 * Sanitize admin input data
 */
export function sanitizeAdminInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>\"'&]/g, '') // Remove HTML characters
      .replace(/\0/g, '') // Remove null bytes
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeAdminInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip dangerous keys
      if (!['__proto__', 'constructor', 'prototype'].includes(key)) {
        sanitized[key] = sanitizeAdminInput(value);
      }
    }
    return sanitized;
  }

  return input;
}

// Export security configuration for monitoring
export { SECURITY_CONFIG };