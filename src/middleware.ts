import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {jwtVerify} from 'jose';

// Rate limiter implementation inline to avoid import issues in middleware
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    const requests = this.requests.get(identifier) || []
    const recentRequests = requests.filter((timestamp: number) => timestamp > windowStart)
    
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    return true
  }
}

// Rate limiter for security
const rateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Rate limiting
  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimiter.isAllowed(clientIP)) {
    return new Response('Too Many Requests', { status: 429 });
  }
  
  const SECRET = process.env.SECRET;
  if (!SECRET) {
    console.error('JWT SECRET is not configured');
    return Response.redirect(new URL('/login', request.url));
  }
  
  const tokenCookie = request.cookies.get("token");
  if (tokenCookie && tokenCookie.value) {
    try {
      const { payload } = await jwtVerify(tokenCookie.value, new TextEncoder().encode(SECRET));
      
      // Add user info to headers for downstream use
      response.headers.set('x-user-id', String(payload.userId));
      
      return response;
    } catch (err) {
      console.warn('Token verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return Response.redirect(new URL('/login', request.url));
    }
  } else {
    return Response.redirect(new URL('/login', request.url));
  }
}
 
export const config = {
  matcher: ['/((?!login|register|api|resetpassword|cal|roomreserve|_next/static|_next/image|.*\\.png$).*)'],
}