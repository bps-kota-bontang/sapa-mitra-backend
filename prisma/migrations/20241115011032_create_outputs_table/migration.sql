-- CreateTable
CREATE TABLE "outputs" (
    "_id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outputs_pkey" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "outputs" ADD CONSTRAINT "outputs_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
