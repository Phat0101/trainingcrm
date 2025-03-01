/*
  Warnings:

  - You are about to drop the `TrainingType` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "TrainingRecord" ADD COLUMN     "timeDescription" TEXT;

-- DropTable
DROP TABLE "TrainingType";
