import type { NextConfig } from 'next';

const portalUrl = (process.env.WEB_PORTAL_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const nextConfig: NextConfig = {
  transpilePackages: ['@echoflow/ui', '@echoflow/types', '@echoflow/config'],
  async redirects() {
    return [
      { source: '/login', destination: `${portalUrl}/login`, permanent: false },
      { source: '/', destination: `${portalUrl}/admin`, permanent: false },
      { source: '/:path*', destination: `${portalUrl}/admin/:path*`, permanent: false },
    ];
  },
};
export default nextConfig;
