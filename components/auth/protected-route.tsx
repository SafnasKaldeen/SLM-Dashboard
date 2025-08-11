"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.tsx";
import { authConfig, type Role, type Permission } from "@/lib/auth-config";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = "/landing",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated
    if (!user) {
      router.push(fallbackPath);
      return;
    }

    // Check role-based access
    if (requiredRole) {
      const userRoles = user.groups || [];
      if (!userRoles.includes(requiredRole)) {
        router.push("/unauthorized");
        return;
      }
    }

    // Check permission-based access
    if (requiredPermission) {
      const userRoles = user.groups || [];
      const hasPermission = userRoles.some((role) => {
        const rolePermissions = authConfig.permissions[role as Role] || [];
        return rolePermissions.includes(requiredPermission);
      });

      if (!hasPermission) {
        router.push("/unauthorized");
        return;
      }
    }

    setIsAuthorized(true);
  }, [user, isLoading, requiredRole, requiredPermission, router, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <p className="text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
