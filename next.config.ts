import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/mis-compras", destination: "/mis-lotes", permanent: false },
      { source: "/mis-compras/:id", destination: "/mis-lotes/:id", permanent: false },
    ];
  },
};

export default nextConfig;
