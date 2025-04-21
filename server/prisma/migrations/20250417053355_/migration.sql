-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('GUESS_THE_NUMBER', 'ROLL_THE_DICE');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIALS',
ADD COLUMN     "gameCoin" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GameSeason" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "game" "GameType" NOT NULL DEFAULT 'GUESS_THE_NUMBER',
    "score" INTEGER NOT NULL,
    "week" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "game" "GameType" NOT NULL DEFAULT 'GUESS_THE_NUMBER',
    "score" INTEGER NOT NULL,
    "week" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameSeason_userId_key" ON "GameSeason"("userId");

-- CreateIndex
CREATE INDEX "GameSeason_week_idx" ON "GameSeason"("week");

-- CreateIndex
CREATE INDEX "GameSeason_userId_idx" ON "GameSeason"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameSeason_userId_week_key" ON "GameSeason"("userId", "week");

-- CreateIndex
CREATE INDEX "GameAchievement_userId_week_rank_idx" ON "GameAchievement"("userId", "week", "rank");

-- CreateIndex
CREATE INDEX "GameAchievement_week_idx" ON "GameAchievement"("week");

-- CreateIndex
CREATE INDEX "GameAchievement_userId_idx" ON "GameAchievement"("userId");

-- AddForeignKey
ALTER TABLE "GameSeason" ADD CONSTRAINT "GameSeason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAchievement" ADD CONSTRAINT "GameAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
