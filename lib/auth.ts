// import type { NextAuthOptions } from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         // Demo credentials for testing
//         if (credentials?.email === "admin@evfleet.com" && credentials?.password === "admin123") {
//           return {
//             id: "1",
//             email: "admin@evfleet.com",
//             name: "Fleet Administrator",
//             role: "admin",
//           }
//         }

//         if (credentials?.email === "demo@evfleet.com" && credentials?.password === "demo123") {
//           return {
//             id: "2",
//             email: "demo@evfleet.com",
//             name: "Demo User",
//             role: "user",
//           }
//         }

//         return null
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/auth/signin",
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role
//       }
//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.sub!
//         session.user.role = token.role as string
//       }
//       return session
//     },
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// }
