import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import prisma from "./prisma";
import { validateReferralCode, applyReferral } from "./referral-utils";
import { getCookie } from "@/lib/cookies";

// Extend the session types to include user ID
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    [key: string]: any;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    // Configure providers as needed
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add userId to the token if available
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async signIn({ user }) {
      // Check if there's a referral code in the cookie and apply it
      try {
        if (user?.id) {
          // Get referral code from cookie - since we can't access request headers here,
          // we'll use another approach to handle referral application
          // The actual automatic referral application will happen in client-side hooks
        }
      } catch (error) {
        console.error("Error handling referrals during sign in:", error);
        // Don't block the sign-in process if referral handling fails
      }

      return true;
    },
  },
  events: {
    async signIn({ user }) {
      // This event can be used to trigger server-side referral application
      // when needed, but we'll primarily handle this on the client side
      console.log(`User signed in: ${user.id}`);
    },
  },
};
