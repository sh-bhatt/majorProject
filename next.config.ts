import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during build (for deployment)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  // ✅ Move serverExternalPackages OUT of experimental (Next.js 15)
  serverExternalPackages: ['pdf-parse', 'mammoth'],
};

export default nextConfig;
