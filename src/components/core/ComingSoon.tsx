"use client";

import { Rocket, Wrench, Loader } from "lucide-react";

export default function BuildingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[98vh] md:h-[95vh] bg-black p-4">
      {/* Decorative SVG background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute opacity-10 w-[120%] bg-black h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
          fill="none"
        >
          <circle cx="500" cy="500" r="500" fill="black" />
        </svg>
      </div>

      {/* Main content */}
      <div className="z-10 max-w-lg text-center space-y-6">
        <div className="flex items-center justify-center space-x-2 md:space-x-4">
          <Rocket className="h-10 w-10 text-blue-500 animate-bounce" />
          <h1 className="text-4xl font-bold text-yellow-600">
            We Are Building It
          </h1>
          <Wrench className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
        <p className="text-slate-300 text-lg">
          Our team is hard at work crafting something amazing for you. Stay
          tuned—exciting things are on the way!
        </p>
        <p className="text-sm text-slate-400">
          Need updates? Feel free to get in touch or check back soon.
        </p>
      </div>

      {/* Footer spinner */}
      <div className="absolute bottom-20 flex justify-center">
        <Loader className="h-6 w-6 text-gray-500 animate-spin" />
      </div>
    </div>
  );
}
