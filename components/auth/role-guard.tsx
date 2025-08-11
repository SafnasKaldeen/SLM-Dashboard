"use client";

import type React from "react";

import { useAuth } from "@/hooks/use-auth.tsx";
import { authConfig, type Role, type Permission } from "@/lib/auth-config";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: Permission;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const userRoles = user.groups || [];

  // Check role-based access
  if (requiredRole && !userRoles.includes(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission) {
    const hasPermission = userRoles.some((role) => {
      const rolePermissions = authConfig.permissions[role as Role] || [];
      return rolePermissions.includes(requiredPermission);
    });

    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
