// components/providers/session-provider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
