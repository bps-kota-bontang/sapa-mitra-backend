-- CreateEnum
CREATE TYPE "TypeConfiguration" AS ENUM ('AUTHORITY', 'REGION', 'RATE');

-- CreateTable
CREATE TABLE "configurations" (
    "_id" TEXT NOT NULL,
    "name" "TypeConfiguration" NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("_id")
);
