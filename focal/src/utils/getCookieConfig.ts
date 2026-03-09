// Environment-aware cookie configuration for secure JWT storage

export interface CookieConfig {
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  path: string;
  domain?: string;
}

export function getCookieConfig(): CookieConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return {
    // Allow non-HTTPS in development/localhost only for testing
    secure: !isDevelopment || !isLocalhost,
    
    // Use 'strict' to prevent CSRF attacks (cookies only sent to same site)
    // Use 'lax' if you need cross-site form submissions
    sameSite: 'strict',
    
    // Root path - accessible from all routes
    path: '/',
    
    // Undefined lets browser automatically use current domain
    // Explicitly set if you need subdomains to share cookies
    domain: undefined,
  };
}

/**
 * Cookie Security Flags:
 * 
 * Secure: true
 *   - Cookies only sent over HTTPS
 *   - Prevents MITM attacks
 *   - Must be false for localhost development (HTTP)
 *
 * HttpOnly: true (set by AWS Amplify backend)
 *   - Prevents JavaScript access via document.cookie
 *   - Protects against XSS attacks
 *   - Backend/middleware can still access
 *
 * SameSite: 'strict'
 *   - Cookies not sent in cross-site requests
 *   - Prevents CSRF attacks
 *   - 'strict' = most secure
 *   - 'lax' = allows some cross-site navigation
 *   - 'none' = sent in all contexts (requires Secure flag)
 */
