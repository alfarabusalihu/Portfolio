import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: isProd ? 'export' : undefined,
  distDir: isProd ? 'out' : undefined,
  basePath: '',
  assetPrefix: isProd ? '/' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
