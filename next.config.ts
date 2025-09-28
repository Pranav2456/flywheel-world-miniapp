import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*', 'https://flywheel-world-miniapp.vercel.app'],
  reactStrictMode: false,
};

export default nextConfig;
