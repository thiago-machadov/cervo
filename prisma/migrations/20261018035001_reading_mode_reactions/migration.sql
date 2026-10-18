-- CreateEnum
CREATE TYPE "ReadingMode" AS ENUM ('FIXED', 'FREE');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "readingMode" "ReadingMode" NOT NULL DEFAULT 'FIXED';

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reaction_checkInId_idx" ON "Reaction"("checkInId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_checkInId_userId_emoji_key" ON "Reaction"("checkInId", "userId", "emoji");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Segurança: bloqueia a Data API pública (o Prisma não é afetado).
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;
