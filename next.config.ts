import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.101.183","192.168.3.34"],
  
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
