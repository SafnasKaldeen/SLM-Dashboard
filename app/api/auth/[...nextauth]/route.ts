// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      checks: ["pkce", "state"], // security best practices
    }),
  ],

  session: {
    strategy: "jwt", // store minimal info in cookie
    maxAge: 24 * 60 * 60, // 1 day
  },

  callbacks: {
    // Minimal JWT storage to avoid oversized cookies
    async jwt({ token, account, user }) {
      if (user) {
        token.user = {
          name: user.name || user.email,
          email: user.email,
        };
      }

      // Only store access token if you need it in client
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) {
        session.user = {};
      }

      // Type assertion because we know token.user matches session.user shape
      session.user = token.user as {
        name?: string;
        email?: string;
      };

      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect logic after login/logout
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/realtime`;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
