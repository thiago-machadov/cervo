-- A tabela interna do Prisma também fica no schema public: bloqueia o acesso pela Data API.
-- Condicional porque o shadow database do `migrate dev` não tem essa tabela.
DO $$
BEGIN
  IF to_regclass('public."_prisma_migrations"') IS NOT NULL THEN
    ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;
