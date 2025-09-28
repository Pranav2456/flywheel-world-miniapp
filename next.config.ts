import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*', 'https://section-postposted-revision-character.trycloudflare.com'],
  reactStrictMode: false,
};

export default nextConfig;
