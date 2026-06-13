import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { comparePasswords } from "@/lib/auth-utils";
import { getUserByEmail } from "@/lib/user-db";
import { isBlocked, recordFailedAttempt, resetAttempts } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email;

        // Check if account is locked
        if (isBlocked(email)) {
          throw new Error("Account locked due to too many failed attempts");
        }

        try {
          const user = await getUserByEmail(email);

          if (!user || !user.password) {
            recordFailedAttempt(email);
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await comparePasswords(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            recordFailedAttempt(email);
            throw new Error("Invalid credentials");
          }

          // Reset attempts on successful login
          resetAttempts(email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signIn",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

