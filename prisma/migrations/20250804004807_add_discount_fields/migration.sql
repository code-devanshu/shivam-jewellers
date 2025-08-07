-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "isBestseller" BOOLEAN DEFAULT false,
ADD COLUMN     "originalPrice" INTEGER;
