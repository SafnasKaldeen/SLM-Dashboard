// app/auth/error/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return {
          title: "Server Configuration Error",
          message:
            "There is a problem with the authentication server configuration. Please contact support.",
          suggestion: "Try again later or contact your administrator.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to access this application.",
          suggestion:
            "Please check with your administrator about account permissions.",
        };
      case "Verification":
        return {
          title: "Verification Failed",
          message:
            "The verification token has expired or has already been used.",
          suggestion: "Please try signing in again.",
        };
      case "Default":
        return {
          title: "Authentication Error",
          message: "An unexpected error occurred during authentication.",
          suggestion:
            "Please try again or contact support if the problem persists.",
        };
      default:
        return {
          title: "Authentication Error",
          message: "Something went wrong during the authentication process.",
          suggestion:
            "Please try again or contact support if the problem continues.",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  const handleRetry = () => {
    router.push("/");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-gradient-to-br from-gray-900/50 to-black/50 border-white/10 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {errorInfo.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gray-300 leading-relaxed">{errorInfo.message}</p>
            <p className="text-sm text-gray-400">{errorInfo.suggestion}</p>
          </div>

          {error && (
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-mono">
                Error Code: {error}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white hover:text-black"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
