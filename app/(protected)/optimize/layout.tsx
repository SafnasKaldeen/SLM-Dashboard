import type React from "react";
import type { Metadata, Viewport } from "next";

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Route Optimizer MVP - Mobile-friendly route optimization made easy",
  description:
    "Plan your perfect journey with intelligent waypoint optimization, real-time traffic data, and seamless mobile experience.",
  keywords:
    "route optimization, navigation, waypoints, Google Maps, mobile-first",
  authors: [{ name: "Route Optimizer Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
