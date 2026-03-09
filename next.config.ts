import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "icons.llamao.fi",
        pathname: "/icons/**",
      },
    ],
  },
}

export default nextConfig
