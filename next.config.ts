import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['static.usernames.app-backend.toolsforhumanity.com'],
  },
  allowedDevOrigins: ['*', 'https://david-bless-submitting-saying.trycloudflare.com', 'https://standings-evaluated-cnet-sandra.trycloudflare.com'], // Add your dev origin here
  reactStrictMode: false,
};

export default nextConfig;
