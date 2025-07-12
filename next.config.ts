import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'glamfric-portal-images-2025.s3.eu-west-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'glamfric-portal-images-2025.s3.amazonaws.com',
        pathname: '/**',
      },
      // Allow localhost for proxy API
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
      // Add CloudFront domain if you use it in the future
      // {
      //   protocol: 'https',
      //   hostname: 'your-cloudfront-domain.cloudfront.net',
      //   pathname: '/**',
      // },
    ],
  },
};

export default nextConfig;
