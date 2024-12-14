-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'Unisex',
ADD COLUMN     "material" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "subcategory" TEXT;
