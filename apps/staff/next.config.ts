import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  transpilePackages: ['@echoflow/ui', '@echoflow/types', '@echoflow/config'],
};

export default nextConfig;
