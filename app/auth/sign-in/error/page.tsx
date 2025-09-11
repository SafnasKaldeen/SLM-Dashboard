// app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You don't have permission to access this resource.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error in constructing an authorization URL.";
      case "OAuthCallback":
        return "Error in handling the response from an OAuth provider.";
      case "OAuthCreateAccount":
        return "Could not create OAuth account.";
      case "EmailCreateAccount":
        return "Could not create email account.";
      case "Callback":
        return "Error in the OAuth callback handler route.";
      case "OAuthAccountNotLinked":
        return "The account is not linked to any OAuth provider.";
      case "EmailSignin":
        return "Sending the e-mail with the verification token failed.";
      case "CredentialsSignin":
        return "The authorize callback returned null in the Credentials provider.";
      case "SessionRequired":
        return "The content of this page requires you to be signed in at all times.";
      default:
        return "An unexpected error occurred during authentication.";
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
          {error && (
            <p className="mt-2 text-center text-xs text-gray-500">
              Error code: {error}
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <Link
            href="/auth/sign-in"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try signing in again
          </Link>

          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
