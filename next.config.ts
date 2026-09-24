import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: loopback literals other than `localhost` are blocked by default.
  allowedDevOrigins: ["127.0.0.1", "[::1]"],
};

export default nextConfig;
