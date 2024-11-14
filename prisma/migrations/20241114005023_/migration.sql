-- CreateEnum
CREATE TYPE "Team" AS ENUM ('SOSIAL', 'PRODUKSI', 'DISTRIBUSI', 'NERWILIS', 'IPDS', 'TU');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('ANGGOTA', 'KETUA', 'KEPALA');

-- CreateEnum
CREATE TYPE "CategoryActivity" AS ENUM ('ENUMERATION', 'SUPERVISION', 'PROCESSING');

-- CreateTable
CREATE TABLE "activities" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" "CategoryActivity" NOT NULL,
    "team" "Team" NOT NULL,
    "isSpecial" BOOLEAN NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "users" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "position" "Position" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
