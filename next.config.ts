import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  output: 'export', // Static export for Electron
  distDir: 'out', // Output directory
  trailingSlash: true, // Required for client-side navigation in file:// protocol
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  // Skip API routes during build (Electron uses IPC instead)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopack config (required for Next.js 16+)
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: true, // Disabled in both dev and production (Electron doesn't need PWA)
  register: false,
})(nextConfig);
