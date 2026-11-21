import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Heat Transfer Dashboard is a separate static Next export living in public/heat-transfer/
  async rewrites() {
    return [
      { source: "/heat-transfer", destination: "/heat-transfer/index.html" },
      { source: "/heat-transfer/", destination: "/heat-transfer/index.html" },
    ];
  },
};

export default nextConfig;
