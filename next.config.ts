import type { NextConfig } from "next";

const backendUrl =
  process.env.API_PROXY_URL || "https://iaasrenovacion.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
