/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@saas-erp/shared'],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
