export const authConfig = {
  // Cognito Configuration
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
    region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
    identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || "",
  },

  // OAuth Configuration (for Google, Facebook, etc.)
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
    scope: ["email", "openid", "profile"],
    redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || "http://localhost:3000/",
    redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || "http://localhost:3000/landing",
    responseType: "code" as const,
  },

  // RBAC Configuration
  roles: {
    ADMIN: "admin",
    FLEET_MANAGER: "fleet_manager",
    ANALYST: "analyst",
    VIEWER: "viewer",
  },

  // Permission mappings
  permissions: {
    admin: [
      "dashboard:read",
      "dashboard:write",
      "analytics:read",
      "analytics:write",
      "fleet:read",
      "fleet:write",
      "users:read",
      "users:write",
      "settings:read",
      "settings:write",
    ],
    fleet_manager: ["dashboard:read", "analytics:read", "fleet:read", "fleet:write"],
    analyst: ["dashboard:read", "analytics:read", "analytics:write"],
    viewer: ["dashboard:read"],
  },
} as const

export type Role = keyof typeof authConfig.permissions
export type Permission = (typeof authConfig.permissions)[Role][number]
