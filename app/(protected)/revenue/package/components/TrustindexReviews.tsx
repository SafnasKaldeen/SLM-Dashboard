"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function TrustindexReviews() {
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef(null);

  const handleScriptLoad = () => {
    console.log("Trustindex script loaded");
    setScriptReady(true);

    // Force Trustindex to initialize
    if (typeof window !== "undefined" && window.Trustindex) {
      try {
        window.Trustindex.init_purehtml();
        console.log("Trustindex initialized");
      } catch (error) {
        console.error("Trustindex init error:", error);
      }
    }
  };

  useEffect(() => {
    // Re-initialize when component mounts if script already loaded
    if (scriptReady && window.Trustindex) {
      const timer = setTimeout(() => {
        try {
          window.Trustindex.init_purehtml();
        } catch (error) {
          console.error("Re-init error:", error);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [scriptReady]);

  return (
    <>
      {/* Use Next.js Script component for better control */}
      <Script
        src="https://cdn.trustindex.io/loader.js?4e8af5d561d43182ff5620e654d"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={(e) => console.error("Script failed to load", e)}
      />

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Our customers love working with us
            </h2>
            <p className="text-gray-600 text-lg">
              because we put their needs first, they trust us and keep coming
              back.
            </p>
          </div>

          {/* Trustindex Widget Container */}
          <div className="max-w-6xl mx-auto" ref={widgetRef}>
            {/* Method 1: Standard widget div */}
            <div
              className="trustindex-widget"
              data-widget-id="4e8af5d561d43182ff5620e654d"
              data-height="auto"
            />

            {/* Loading fallback */}
            {!scriptReady && (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600">Loading reviews...</p>
                </div>
              </div>
            )}
          </div>

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Script ready: {scriptReady ? "✓" : "✗"} | Trustindex available:{" "}
              {typeof window !== "undefined" && window.Trustindex ? "✓" : "✗"}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
