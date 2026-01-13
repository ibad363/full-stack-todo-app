// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  const isChatPage = request.nextUrl.pathname.startsWith('/chat');

  // If trying to access protected pages (dashboard or chat) without token, redirect to login
  if ((isDashboardPage || isChatPage) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access auth pages with token, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/login', '/register'],
};
