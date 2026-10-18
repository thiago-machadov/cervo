import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// Sem cache incremental: o app é todo dinâmico (cada página depende do usuário logado).
export default defineCloudflareConfig({})
