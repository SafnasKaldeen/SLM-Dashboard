// components/landing/landing-page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Play,
  Shield,
  Zap,
  Globe,
  Users,
  Award,
  ChevronDown,
  X,
} from "lucide-react";
import { LoginModal } from "@/components/landing/login-modal";

// Video Modal Component
function VideoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const openYouTubeDirectly = () => {
    window.open("https://youtu.be/R0jmOykZqx4", "_blank");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-5">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-lg">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-5">
            <div className="text-center space-y-6 p-8">
              <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <Play className="w-12 h-12 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Video Unavailable
                </h3>
                <p className="text-gray-300 mb-6">
                  This video cannot be embedded due to privacy settings.
                  <br />
                  Click below to watch on YouTube directly.
                </p>
                <Button
                  onClick={openYouTubeDirectly}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch on YouTube
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* YouTube Embed */}
        {!hasError && (
          <>
            <iframe
              src="https://www.youtube-nocookie.com/embed/R0jmOykZqx4?autoplay=0&rel=0&modestbranding=1&controls=1"
              title="SL-Mobility Demo Video"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ display: hasError ? "none" : "block" }}
            />

            <div className="absolute bottom-4 left-4 z-10">
              <Button
                onClick={openYouTubeDirectly}
                variant="outline"
                className="bg-black/70 border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Open in YouTube
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Simple 3D Scooter Placeholder Component
function ScooterModel3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl" />
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000" />

      {/* Scooter Representation */}
      <div className="relative z-10 space-y-8">
        {/* Main Body */}
        <div className="relative">
          <div className="w-48 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-2xl shadow-2xl border border-white/10">
            <div className="absolute inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl" />

            {/* Battery Indicator */}
            <div className="absolute top-2 right-2 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">98%</span>
            </div>

            {/* Speed Display */}
            <div className="absolute bottom-2 left-2">
              <span className="text-cyan-400 text-sm font-bold">25 km/h</span>
            </div>
          </div>

          {/* Handles */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-600 rounded-full" />
        </div>

        {/* Wheels */}
        <div className="flex justify-between px-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-2 border-white/20 flex items-center justify-center">
            <div
              className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-spin"
              style={{ animationDuration: "2s" }}
            />
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full border-2 border-white/20 flex items-center justify-center">
            <div
              className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-spin"
              style={{ animationDuration: "2s" }}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-green-400">Connected</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400">Charging</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: "Analytics Platform",
      description:
        "Real-time dashboards and comprehensive analytics for fleet monitoring and performance optimization",
    },
    {
      icon: Shield,
      title: "Back Office Systems",
      description:
        "Complete administrative tools for operations, HR, finance, and compliance management",
    },
    {
      icon: Globe,
      title: "Transaction Portal",
      description:
        "Real-time transaction processing, payment systems, and financial reporting tools",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Employee directory, role management, and collaborative workspace access",
    },
  ];

  const stats = [
    { value: "12+", label: "Platforms" },
    { value: "99.9%", label: "Uptime" },
    { value: "500+", label: "Employees" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SL-Mobility
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#platforms"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Platforms
              </a>
              <a
                href="#analytics"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Analytics
              </a>
              <a
                href="#support"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Support
              </a>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
                onClick={() => setIsLoginOpen(true)}
              >
                Employee Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 h-screen grid lg:grid-cols-2">
          {/* Left Section */}
          <div className="flex items-center justify-center px-6 lg:px-12">
            <div className="space-y-8 max-w-xl animate-in slide-in-from-left duration-800">
              <Badge className="mt-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30">
                <Award className="w-4 h-4 mr-2" />
                SL-Mobility Employee Portal
              </Badge>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Employee
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Dashboard Hub
                  </span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed">
                  Access all company platforms, analytics dashboards, and
                  back-office systems through our unified employee portal. Your
                  gateway to real-time operational insights and management
                  tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-6 text-lg group"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Access Portal
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white hover:text-black px-8 py-6 text-lg bg-transparent group"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Product Overview
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="text-center animate-in slide-in-from-bottom duration-600"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-center px-3 lg:px-6">
            <div className="relative w-full max-w-lg h-[550px] lg:h-[550px] animate-in slide-in-from-right duration-800 delay-200">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-3xl blur-3xl" />
              <Card className="relative h-full bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10 backdrop-blur-sm">
                <CardContent className="p-0 h-full">
                  <ScooterModel3D />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-in fade-in duration-1000 delay-1000">
          <div className="flex flex-col items-center space-y-2 text-gray-400">
            <span className="text-sm">Scroll to explore</span>
            <div className="animate-bounce">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900/50 to-black" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Access All
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Company Platforms
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Streamlined access to all internal systems, dashboards, and
              operational tools through our unified employee portal
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:-translate-y-2 transition-all duration-300"
              >
                <Card className="h-full bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
