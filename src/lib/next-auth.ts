import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import prisma from "./prisma";
import { validateReferralCode, applyReferral } from "./referral-utils";
import { getCookie } from "@/lib/cookies";

// Extend the session types to include user ID and wallet addresses
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
      solanaAddress?: string | null;
      evmAddress?: string | null;
      referralCode?: string | null;
    };
  }

  interface User {
    id: string;
    walletAddress?: string | null;
    solanaAddress?: string | null;
    evmAddress?: string | null;
    referralCode?: string | null;
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

        // Fetch additional user data to include in the session
        if (token.sub) {
          try {
            const userData = await prisma.user.findUnique({
              where: { id: token.sub },
              select: {
                walletAddress: true,
                solanaAddress: true,
                evmAddress: true,
                referralCode: true,
              },
            });

            if (userData) {
              session.user.walletAddress = userData.walletAddress;
              session.user.solanaAddress = userData.solanaAddress;
              session.user.evmAddress = userData.evmAddress;
              session.user.referralCode = userData.referralCode;
            }
          } catch (error) {
            console.error(
              "Error fetching user wallet data for session:",
              error
            );
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add userId and wallet addresses to the token if available
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.solanaAddress = user.solanaAddress;
        token.evmAddress = user.evmAddress;
        token.referralCode = user.referralCode;
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
