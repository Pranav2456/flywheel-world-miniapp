import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*', 'https://lamps-strand-southern-mel.trycloudflare.com'],
  reactStrictMode: false,
};

export default nextConfig;
