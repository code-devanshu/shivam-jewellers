import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Skeleton */}
        <div className="relative w-full lg:w-1/2 h-96">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>

        {/* Details Skeleton */}
        <div className="w-full lg:w-1/2">
          {/* Title */}
          <Skeleton className="h-8 w-3/4 mb-4" />

          {/* Price and Badge */}
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />

          {/* Category and Subcategory */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Button */}
          <Skeleton className="h-10 w-32 mt-8" />
        </div>
      </div>
    </div>
  );
}
