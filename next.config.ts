import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A rota que aplica a marca d'água lê este PNG do disco em tempo de
  // execução; sem isso ele não entra no pacote da função na Vercel.
  outputFileTracingIncludes: {
    "/fotos/**": ["./src/lib/fotos/marca-dagua.png"],
  },
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
