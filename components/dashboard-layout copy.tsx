"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainSidebar } from "@/components/main-sidebar";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-black text-slate-100 relative overflow-hidden">
        {/* <div className="min-h-screen bg-transparent relative overflow-hidden"> */}
        {/* 🔁 Background video */}
        {/* <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20 opacity-10"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video> */}

        {/* 🌀 Particle effect (still visible over video) */}
        <div className="absolute inset-0 w-full h-full opacity-30 -z-10">
          <canvas id="particle-canvas" className="w-full h-full" />
        </div>

        {/* Loading Screen */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24">
                {/* ...loading rings (unchanged)... */}
              </div>
              <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">
                SYSTEM INITIALIZING
              </div>
            </div>
          </div>
        )}

        <div className="flex h-screen relative z-10">
          <SidebarProvider>
            <div className="w-64 shrink-0">
              <MainSidebar />
            </div>
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 overflow-auto py-6">
                <div className="container mx-auto">{children}</div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      </div>
    </ThemeProvider>
  );
}
