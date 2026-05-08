/*
  Warnings:

  - You are about to drop the column `rating` on the `tailor_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `reviewCount` on the `tailor_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tailor_profiles" DROP COLUMN "rating",
DROP COLUMN "reviewCount";
