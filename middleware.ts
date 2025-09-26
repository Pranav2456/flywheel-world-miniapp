export { auth as middleware } from '@/auth';

export const config = {
  matcher: ['/home', '/requests/:path*', '/requester', '/resolver'],
};
