import type { NextConfig } from "next";

function publicDevOrigins(): string[] {
  const origins = ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.io"];
  const publicUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL;

  if (publicUrl) {
    try {
      origins.push(new URL(publicUrl).host);
    } catch {
      // ignora URL inválida; o wildcard do ngrok continua a aplicar-se
    }
  }

  return origins;
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-saml/node-saml"],
  allowedDevOrigins: publicDevOrigins(),
};

export default nextConfig;
