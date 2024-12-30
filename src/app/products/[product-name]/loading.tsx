import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-6 bg-black">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
        {/* Left Side - Image Viewer Skeleton */}
        <div className="w-full lg:w-1/2 flex space-x-6 flex-row">
          {/* Thumbnail Skeletons */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="w-20 h-20 rounded-md bg-gray-800"
              />
            ))}
          </div>
          {/* Main Image Skeleton */}
          <Skeleton className="w-full h-[30rem] rounded-lg bg-gray-800" />
        </div>

        {/* Right Side - Details Skeleton */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-3/4 rounded bg-gray-800" />

          {/* Price Skeleton */}
          <Skeleton className="h-6 w-1/4 rounded bg-gray-800" />

          {/* Material Skeleton */}
          <Skeleton className="h-5 w-1/3 rounded bg-gray-800" />

          {/* Badges Skeleton */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className="h-8 w-24 rounded-full bg-gray-800"
              />
            ))}
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-5 w-full rounded bg-gray-800" />
            ))}
          </div>

          {/* Buttons Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-32 rounded bg-gray-800" />
            <Skeleton className="h-12 w-32 rounded bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
