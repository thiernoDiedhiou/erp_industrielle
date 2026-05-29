/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@saas-erp/shared'],
  serverExternalPackages: [],
};

module.exports = nextConfig;
