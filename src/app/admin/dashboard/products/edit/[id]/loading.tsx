"use client";

import { Skeleton } from "@/components/ui/skeleton";

const EditProductSkeleton = () => {
  return (
    <div className="flex flex-col space-y-6 p-6 max-w-5xl mx-auto">
      {/* Product Name */}
      <Skeleton className="h-8 w-2/3" />

      {/* Product ID */}
      <Skeleton className="h-8 w-1/4" />

      {/* Product Description */}
      <Skeleton className="h-32 w-full" />

      {/* Gold Type Dropdown */}
      <Skeleton className="h-8 w-2/3" />

      {/* Jewelry Type Dropdown */}
      <Skeleton className="h-8 w-2/3" />

      {/* Necklace Type Dropdown */}
      <Skeleton className="h-8 w-2/3" />

      {/* Category Dropdown */}
      <Skeleton className="h-8 w-2/3" />

      {/* Upload and Select Images Button */}
      <div className="flex space-x-4 w-full justify-center">
        <Skeleton className="h-12 w-36" />
        <Skeleton className="h-12 w-36" />
      </div>

      {/* Submit Button */}
      <Skeleton className="h-12 w-36 mt-6" />
    </div>
  );
};

export default EditProductSkeleton;
