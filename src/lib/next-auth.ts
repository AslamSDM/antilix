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
    // Credentials provider for wallet authentication
    {
      id: "credentials",
      name: "Wallet",
      type: "credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        email: { label: "Email", type: "email" },
        wallet: { label: "Wallet Address", type: "text" },
        walletType: { label: "Wallet Type", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials?.userId) {
          console.error("No userId provided in credentials");
          return null;
        }

        try {
          console.log(`Authorizing user with userId: ${credentials.userId}`);

          // Find the user based on userId from credentials
          const user = await prisma.user.findUnique({
            where: { id: credentials.userId },
          });

          if (!user) {
            console.error(`User not found with ID: ${credentials.userId}`);
            return null;
          }

          // Return the user object which will be added to the token and session
          return {
            id: user.id,
            name: user.username || undefined,
            email: credentials.email || user.email,
            walletAddress: credentials.wallet || user.walletAddress,
            walletType: credentials.walletType || user.walletType,
            solanaAddress: user.solanaAddress,
            evmAddress: user.evmAddress,
            referralCode: user.referralCode,
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      },
    },
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Set the user ID from the token
        session.user.id = token.sub!;

        // console.log(`Setting up session for user: ${token.sub}`);

        // Include wallet data from token if available
        if (token.walletAddress)
          session.user.walletAddress = token.walletAddress as string;
        if (token.solanaAddress)
          session.user.solanaAddress = token.solanaAddress as string;
        if (token.evmAddress)
          session.user.evmAddress = token.evmAddress as string;
        if (token.referralCode)
          session.user.referralCode = token.referralCode as string;

        // If we don't have complete wallet data in the token, fetch it from the database
        if (!token.walletAddress || !token.walletType) {
          if (token.sub) {
            try {
              console.log(
                `Fetching additional user data for session: ${token.sub}`
              );
              const userData = await prisma.user.findUnique({
                where: { id: token.sub },
                select: {
                  username: true,
                  walletAddress: true,
                  walletType: true,
                  solanaAddress: true,
                  evmAddress: true,
                  referralCode: true,
                },
              });

              if (userData) {
                // Update session with fresh data
                if (userData.username) session.user.name = userData.username;
                if (userData.walletAddress)
                  session.user.walletAddress = userData.walletAddress;
                if (userData.solanaAddress)
                  session.user.solanaAddress = userData.solanaAddress;
                if (userData.evmAddress)
                  session.user.evmAddress = userData.evmAddress;
                if (userData.referralCode)
                  session.user.referralCode = userData.referralCode;

                console.log("Session updated with database user data");
              }
            } catch (error) {
              console.error(
                "Error fetching user wallet data for session:",
                error
              );
            }
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Add userId and wallet addresses to the token if available from sign-in
      if (user) {
        console.log(`Setting JWT token data for user: ${user.id}`);
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.walletType = user.walletType;
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
