import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.101.183"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
