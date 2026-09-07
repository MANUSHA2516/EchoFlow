import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@echoflow/ui', '@echoflow/types', '@echoflow/config'],
};

export default nextConfig;
