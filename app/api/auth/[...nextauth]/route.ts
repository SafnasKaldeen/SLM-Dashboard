// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
      // Remove custom authorization/token/userinfo URLs - let NextAuth handle them automatically
      checks: ["pkce", "state"], // Add PKCE and state checks for security
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        // console.log("Cognito account response:", account); // ✅ print Cognito tokens
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.idToken = token.idToken as string;
      session.refreshToken = token.refreshToken as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/realtime";
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error", // Create this page to handle errors
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };