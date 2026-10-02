import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // EEz is a browser-only study portal, so emit portable static files that
  // can be hosted independently of any paid application server.
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
