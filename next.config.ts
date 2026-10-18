import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Cache Components e Partial Prefetching ficam desligados: no Cloudflare Workers o
  // `setTimeout` funciona de outro jeito e a renderização trava. O app é todo dinâmico
  // (depende da sessão), então não perdemos nada.
  // O tracing do Next (feito em Node) só copia o "empty.js" do pg-cloudflare;
  // no Cloudflare Workers o pg precisa da versão real (condição "workerd").
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pg-cloudflare/**/*"],
  },
  experimental: {
    // Fotos de capa chegam já reduzidas pelo navegador; o limite é só uma margem.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

// Disponibiliza os bindings do wrangler.jsonc (ex.: R2) no `next dev`.
initOpenNextCloudflareForDev();
