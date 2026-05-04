import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@openrun/ui'],
  experimental: {
    // Required for React 19 compatibility
  },
  webpack(config) {
    // mapbox-gl uses worker threads; suppress the warning in Next.js
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    }
    return config
  },
}

export default nextConfig
