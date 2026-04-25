import type { NextConfig } from "next"
const nextConfig = {
  
  
  reactStrictMode: true,
  transpilePackages: ["@pdfme/generator", "@pdfme/common", "@pdfme/schemas"],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dhalparagpbuscket.s3.us-east-2.amazonaws.com",
        pathname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config: { resolve: { fallback: { fs: boolean; }; }; }, { }: any) => {
    config.resolve.fallback = { fs: false }
    return config
  },
};

export default nextConfig;
