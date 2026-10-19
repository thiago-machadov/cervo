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
  // O carregador de WebAssembly do Turbopack usa um caminho dinâmico, e o tracing acaba
  // levando TODO .wasm de node_modules para o Worker (CLI do Prisma, PGlite, compiladores
  // de MySQL/SQLite/SQL Server...). Isso deixava o Worker com ~60 MB e cada início a frio
  // gastava centenas de ms de CPU. O app só usa o compilador Postgres de src/generated/prisma.
  outputFileTracingExcludes: {
    "/**": [
      "./node_modules/prisma/**",
      "./node_modules/@prisma/dev/**",
      "./node_modules/@prisma/engines/**",
      "./node_modules/@prisma/schema-engine-wasm/**",
      "./node_modules/@prisma/prisma-schema-wasm/**",
      "./node_modules/@prisma/query-compiler-wasm/**",
      "./node_modules/@electric-sql/**",
      "./node_modules/blake3-wasm/**",
      "./node_modules/wrangler/**",
      "./node_modules/miniflare/**",
      "./node_modules/workerd/**",
      "./node_modules/@cloudflare/workerd-*/**",
      "./node_modules/esbuild/**",
      "./node_modules/@esbuild/**",
      "./node_modules/typescript/**",
      "./src/generated/prisma-node/**",
    ],
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
