# Cervo

Cervo é um clube do livro mobile first (PWA) para leitores: biblioteca pessoal, check-ins diários de leitura com streaks, clubes do livro com metas, ranking, feed, comentários e convites por link.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19
- shadcn/ui sobre Base UI + Tailwind CSS v4
- Supabase: **Auth** (e-mail e senha, via `@supabase/ssr`) e **Postgres**
- Prisma 7 conectado direto no Postgres do Supabase (`@prisma/adapter-pg`), sem o SDK de dados do Supabase

## Rodando localmente (Supabase local, precisa de Docker)

```bash
npm install
npm run supabase:start   # sobe Auth + Postgres locais (portas 554xx)
npm run db:migrate       # aplica as migrations do Prisma
npm run db:seed          # opcional: contas de exemplo (veja prisma/seed.ts)
npm run dev
```

O `.env` local aponta para o Supabase local (valores de `supabase status -o env`).
E-mails de confirmação ficam no Mailpit: http://127.0.0.1:55424

## Usando um projeto Supabase na nuvem

1. Copie `.env.example` para `.env` e preencha com os dados do projeto (Connect → ORMs → Prisma e Project Settings → API Keys).
2. Rode `npm run db:deploy` para criar as tabelas.
3. Em Authentication → URL Configuration, configure o Site URL e adicione `https://SEU-DOMINIO/auth/confirm` nas Redirect URLs.

### Segurança

O Supabase expõe o schema `public` pela Data API com a chave pública. Todas as tabelas têm **RLS ligado e sem políticas**,
o que bloqueia esse acesso; o Prisma conecta como dono do banco e não é afetado. **Toda tabela nova precisa de
`ALTER TABLE "Nome" ENABLE ROW LEVEL SECURITY;` na migration.**

## Estrutura

- `src/app/(auth)` — entrar e criar conta
- `src/app/(app)` — Hoje, Biblioteca, Clubes, Perfil, check-in e convite
- `src/app/actions` — Server Actions (sempre revalidam a sessão no servidor)
- `src/lib/queries.ts` — leitura de dados (feed, ranking, streaks)
- `src/lib/supabase/` — clientes do Supabase (só Auth) e renovação de sessão no proxy
- `src/lib/session.ts` / `src/lib/auth.ts` — sessão verificada e perfil do usuário (tabela `User`, mesmo id do Supabase Auth)
- `src/app/auth/confirm` — destino do link de confirmação de e-mail
- Tema (cores cobalto/papel, fontes) em `src/app/globals.css` e `src/app/layout.tsx`

O "dia" de um check-in usa o fuso `America/Sao_Paulo` (`src/lib/dates.ts`).
