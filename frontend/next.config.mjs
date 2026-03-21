/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blocks.mvp-subha.me',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
