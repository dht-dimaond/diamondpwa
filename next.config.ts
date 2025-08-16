import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['img.clerk.com'], // Allow Clerk image URLs
  },
};

export default nextConfig;
