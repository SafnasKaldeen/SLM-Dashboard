// app/auth/sign-in/page.tsx
import { Suspense } from "react";
import SignInContent from "./SignInContent";

// Loading component for the suspense boundary
function SignInLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-cyan-400">Loading...</span>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
}
