import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Wrap NextAuth middleware so we can also enforce verification cookie
export default auth((req) => {
  const { nextUrl, cookies } = req;
  const isVerified = cookies.get('fw_verified')?.value === 'true';
  const pathname = nextUrl.pathname;

  // If user visits onboarding and is already verified, send them to home
  if (pathname === '/onboarding') {
    if (isVerified) {
      return NextResponse.redirect(new URL('/home', nextUrl));
    }
    return NextResponse.next();
  }

  // For protected routes, require verification
  if (!isVerified) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/home', '/requests/:path*', '/requester', '/resolver', '/onboarding'],
};
