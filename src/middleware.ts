import type { NextRequest } from 'next/server';
import {jwtVerify} from 'jose';
 
export async function middleware(request: NextRequest) {
  let currentUserId = null;
  const SECRET = process.env.SECRET;
  const tokenCookie = request.cookies.get("token");
  if (tokenCookie && tokenCookie.value) {
    try {
      const { payload } = await jwtVerify(tokenCookie.value, new TextEncoder().encode(SECRET));
      currentUserId = payload.userId;
    } catch (err) {
      console.error('Token verification failed:', err);
      return Response.redirect(new URL('/login', request.url));
    }
  }
  else {
    return Response.redirect(new URL('/login', request.url));
  }
}
 
export const config = {
  matcher: ['/((?!login|register|api|resetpassword|cal|_next/static|_next/image|.*\\.png$).*)'],
}