// components/ui/loading-spinner.tsx
"use client";

import { Zap } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
          <Zap className="w-8 h-8 text-white" />
        </div>

        {/* Loading Animation */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <p className="text-white text-lg font-medium">Loading...</p>
          <p className="text-gray-400 text-sm">
            Please wait while we set things up
          </p>
        </div>
      </div>
    </div>
  );
}
