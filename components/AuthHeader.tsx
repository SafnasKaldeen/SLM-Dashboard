"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/auth/sign-in",
      redirect: true,
    });
  };

  if (status === "loading") {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Analytics Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">
                  {session.user?.name || session.user?.email}
                </p>
                <p className="text-gray-500 text-xs">{session.user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
