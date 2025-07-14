import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
    output: 'export',  
    distDir: 'out',  
     basePath: '',
  assetPrefix: isProd ? '/' : '',
    images: {
    unoptimized: true 
  }
};

export default nextConfig;
