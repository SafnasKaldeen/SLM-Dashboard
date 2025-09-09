// Create this file: app/debug/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/debug/cognito");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const testNextAuthEndpoint = async () => {
    try {
      const response = await fetch("/api/auth/providers");
      const providers = await response.json();
      console.log("NextAuth Providers:", providers);
      alert("Check console for provider information");
    } catch (err) {
      console.error("NextAuth test failed:", err);
      alert("NextAuth endpoint test failed - check console");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Cognito Debug Information
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {config && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Environment Variables
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{key}:</span>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        value === "Missing"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {key.includes("SECRET")
                        ? value === "Missing"
                          ? "Missing"
                          : "***"
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
              <div className="space-y-4">
                <button
                  onClick={testNextAuthEndpoint}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Test NextAuth Providers Endpoint
                </button>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <h3 className="font-medium text-yellow-800">
                    Cognito Callback URL Check
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your Cognito callback URL should be:
                    <code className="bg-yellow-100 px-2 py-1 rounded ml-1">
                      {window.location.origin}/api/auth/callback/cognito
                    </code>
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h3 className="font-medium text-blue-800">
                    Expected Cognito Configuration
                  </h3>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>
                      ✓ App client type: Public client or Confidential client
                      with secret
                    </li>
                    <li>✓ OAuth 2.0 grant types: Authorization code grant</li>
                    <li>✓ OAuth 2.0 scopes: openid, email, profile</li>
                    <li>
                      ✓ Callback URLs: {window.location.origin}
                      /api/auth/callback/cognito
                    </li>
                    <li>✓ Sign out URLs: {window.location.origin}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Common Issues & Solutions
              </h2>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium">
                    Issue: "Login pages unavailable"
                  </h4>
                  <p>
                    Usually caused by incorrect callback URLs or missing OAuth
                    configuration in Cognito.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium">Issue: "Configuration error"</h4>
                  <p>
                    Check that CLIENT_ID, CLIENT_SECRET, REGION, and
                    USER_POOL_ID are all set correctly.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-medium">Issue: "OAuthCallback error"</h4>
                  <p>
                    Verify that your callback URL in Cognito exactly matches the
                    one shown above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
