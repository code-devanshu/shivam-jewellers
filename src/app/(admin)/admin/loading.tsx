export default function Loading() {
  return (
    <div className="absolute inset-0 bg-white/70 bg-white h-full w-screen backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
      <div className="flex flex-col items-center justify-center space-y-2 text-gray-700">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[50px] font-bold text-pink-600">⏳</span>
          </div>
        </div>
        <p className="text-2xl font-medium text-center animate-pulse">
          Setting up your dashboard ...
        </p>
      </div>
    </div>
  );
}
