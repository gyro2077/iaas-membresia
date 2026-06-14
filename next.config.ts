import type { NextConfig } from "next";

const backendOrigin =
  process.env.API_PROXY_TARGET ?? "https://iaasrenovacion.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
