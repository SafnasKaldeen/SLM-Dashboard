// app/auth/sign-in/SignInContent.tsx
"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Zap,
  AlertCircle,
  ArrowLeft,
  Globe,
  Users,
  Award,
} from "lucide-react";

export default function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleAuthFlow = async () => {
      // Check if user is already signed in first
      const session = await getSession();
      if (session) {
        router.push("/realtime");
        return;
      }

      // Check for errors in URL params
      const errorParam = searchParams.get("error");
      const callbackUrl = searchParams.get("callbackUrl");

      if (errorParam) {
        setError(errorParam);
        setIsProcessing(true);

        // Clear any existing timeouts
        if (errorTimeoutRef.current) {
          clearTimeout(errorTimeoutRef.current);
        }
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }

        // Show processing state for 3 seconds
        processingTimeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
        }, 3000);

        // Wait 3 seconds before showing the error
        errorTimeoutRef.current = setTimeout(() => {
          // Double-check if user got authenticated in the meantime
          getSession().then((latestSession) => {
            if (latestSession) {
              router.push("/realtime");
            } else {
              setShowError(true);
              setIsProcessing(false);
            }
          });
        }, 3000);
      }
    };

    handleAuthFlow();

    // Cleanup timeouts on unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, [router, searchParams]);

  // Periodic session check during processing
  useEffect(() => {
    if (isProcessing) {
      const sessionCheckInterval = setInterval(async () => {
        const session = await getSession();
        if (session) {
          // Clear timeouts and redirect
          if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
          }
          if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
          }
          setIsProcessing(false);
          router.push("/realtime");
        }
      }, 1000);

      return () => clearInterval(sessionCheckInterval);
    }
  }, [isProcessing, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setShowError(false);
    setIsProcessing(false);

    // Clear any existing timeouts
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    try {
      const result = await signIn("cognito", {
        callbackUrl: "/realtime",
        redirect: true,
      });

      // Note: signIn with redirect: true typically doesn't return anything
      // as it redirects immediately. This is for edge cases.
      if (result?.error) {
        setError(result.error);
        console.error("Sign in error:", result.error);
        setShowError(true);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    // Clear any pending timeouts before navigating
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    router.push("/");
  };

  const retrySignIn = () => {
    setError(null);
    setShowError(false);
    setIsProcessing(false);
    handleSignIn();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SL-Mobility
            </span>
          </div>

          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
            onClick={handleBackToHome}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto w-full">
          {/* Left Section - Info Panel */}
          <div className="space-y-8 animate-in slide-in-from-left duration-800">
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30">
              <Shield className="w-4 h-4 mr-2" />
              Secure Employee Access
            </Badge>

            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Welcome Back
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  to SL-Mobility
                </span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed">
                Sign in to access your personalized dashboard with real-time
                analytics, fleet management tools, and operational insights.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {[
                { icon: "📊", text: "Real-time Analytics Dashboard" },
                { icon: "🚗", text: "Fleet Management Tools" },
                { icon: "⚡", text: "Operational Insights" },
                { icon: "🔒", text: "Secure Access Control" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-sm">{feature.icon}</span>
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "500+", label: "Employees" },
                { value: "24/7", label: "Support" },
              ].map((stat, index) => (
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

          {/* Right Section - Sign In Form */}
          <div className="flex items-center justify-center animate-in slide-in-from-right duration-800 delay-200">
            <div className="w-full max-w-md">
              {/* Glowing Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />

              <Card className="relative bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/20 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      Employee Sign In
                    </h2>
                    <p className="text-gray-300">
                      Access your analytics dashboard
                    </p>
                  </div>

                  {/* Processing State */}
                  {isProcessing && (
                    <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-blue-300 mb-1">
                            Processing Authentication
                          </h3>
                          <p className="text-sm text-blue-400">
                            Please wait while we complete the sign-in process...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && showError && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <h3 className="text-sm font-medium text-red-300 mb-1">
                            Authentication Error
                          </h3>
                          <p className="text-sm text-red-400 mb-3">{error}</p>
                          {error.includes("OAuthCallback") && (
                            <p className="text-xs text-red-300 mb-3">
                              This may be a temporary issue with the
                              authentication flow.
                            </p>
                          )}
                          <Button
                            onClick={retrySignIn}
                            size="sm"
                            className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sign In Options */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleSignIn}
                      disabled={isLoading || isProcessing}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-6 text-lg group shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                          Signing in...
                        </div>
                      ) : isProcessing ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                          Processing...
                        </div>
                      ) : (
                        <>
                          Sign in with AWS Cognito
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Help Text */}
                  <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                      Having trouble? Check the browser console for detailed
                      error messages.
                    </p>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                        Secure Connection
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
