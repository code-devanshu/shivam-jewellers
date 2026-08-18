import CustomersTableSkeleton from "./CustomersTableSkeleton";

export default function CustomersLoading() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="h-7 w-40 bg-blush/60 rounded-full animate-pulse" />
        <div className="h-4 w-56 bg-blush/40 rounded-full animate-pulse mt-2" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
          <div className="h-8 w-40 bg-blush/60 rounded-lg animate-pulse" />
        </div>
        <CustomersTableSkeleton />
      </div>
    </div>
  );
}
