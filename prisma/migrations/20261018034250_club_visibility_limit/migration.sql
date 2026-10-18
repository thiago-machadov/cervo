-- CreateEnum
CREATE TYPE "ClubVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "maxMembers" INTEGER,
ADD COLUMN     "visibility" "ClubVisibility" NOT NULL DEFAULT 'PRIVATE';
