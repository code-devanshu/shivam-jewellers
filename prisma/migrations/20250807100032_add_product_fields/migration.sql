/*
  Warnings:

  - You are about to drop the column `isBestseller` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "isBestseller",
DROP COLUMN "originalPrice",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "subCategory" TEXT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL;
