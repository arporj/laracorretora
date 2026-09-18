import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Imagens de placeholder (banners/ambientação) até termos fotos próprias.
        // Ver PLACEHOLDERS.md para a lista do que precisa ser substituído.
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
