import { Account, User as AuthUser, Session } from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import connect from "@/lib/db";
import bcrypt from "bcryptjs";
import User from "@/models/user";

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Credentials) {
        await connect();

        try {
          const user = await User.findOne({ email: credentials.email });
          if (user) {
            if (user.provider !== "credentials") {
              throw new Error(`Please use ${user.provider} login for this email.`);
            }

            const match = await bcrypt.compare(credentials.password, user.password);
            if (match) {
              return user;
            }
          }
          throw new Error("Invalid email or password");
        } catch (error: any) {
          throw new Error(error.message || "Authorization failed");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email",
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: AuthUser; account: Account }) {
      if (account.provider === "credentials") {
        return true; // Allow credential sign-in
      }
      await connect();
      try {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = new User({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
          });
          await newUser.save();
        }
        return true; // User exists or created successfully
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Sign-in failed
      }
    },
    async session({ session, user }: { session: Session; user: AuthUser }) {
      await connect();
      try {
        const userDetails = await User.findOne({ email: session.user?.email });
        if (userDetails) {
          session.user = { ...session.user, ...userDetails.toObject() };
        }
        return session; // Return updated session
      } catch (error) {
        console.error("Error in session callback:", error);
        throw new Error("Session update failed");
      }
    },
  },
};
