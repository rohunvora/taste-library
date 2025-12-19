import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Are.na images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.are.na',
      },
      {
        protocol: 'https',
        hostname: '*.are.na',
      },
      {
        protocol: 'https',
        hostname: 'd2w9rnfcy7mm78.cloudfront.net',
      },
    ],
  },
  
  // For static export (optional, helps with Vercel)
  output: 'standalone',
};

export default nextConfig;
