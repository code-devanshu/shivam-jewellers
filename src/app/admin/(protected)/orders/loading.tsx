export default function Loading() {
  return (
    <div className="p-8">
      <div className="h-8 w-32 bg-gray-100 rounded-lg mb-2 animate-pulse" />
      <div className="h-4 w-20 bg-gray-100 rounded mb-6 animate-pulse" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-6 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse hidden md:block" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
