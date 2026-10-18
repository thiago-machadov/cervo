-- CreateEnum
CREATE TYPE "FeedbackKind" AS ENUM ('BUG', 'IDEA', 'PRAISE', 'OTHER');

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "photoUrl" TEXT;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "FeedbackKind" NOT NULL,
    "message" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bloqueia a Data API pública do Supabase (o app acessa só via Prisma).
ALTER TABLE "Feedback" ENABLE ROW LEVEL SECURITY;
