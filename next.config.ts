import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public dev subdomain (pub-<hash>.r2.dev)
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
      {
        // Cloudflare R2 direct bucket endpoint
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
