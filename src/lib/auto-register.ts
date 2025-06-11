import { v4 as uuidv4 } from "uuid";
import {
  generateUniqueReferralCode,
  validateReferralCode,
  applyReferral,
} from "./referral-utils";
import prisma from "./prisma";
import { getCookie } from "./cookies";
import { mergeWalletAccounts } from "./merge-accounts";

import { MergedUserResult } from "./merge-accounts";

/**
 * Automatically registers a user when they connect their wallet
 * This replaces the traditional signup flow as users should be registered
 * just by connecting their wallet
 *
 * @returns Either a string (userId) if no merge happened, or a MergedUserResult object if accounts were merged
 */
export async function autoRegisterUser(
  address: string,
  type: "ethereum" | "solana"
): Promise<string | MergedUserResult> {
  try {
    // Check if a user with this wallet already exists in either wallet field
    const walletField = type === "solana" ? "solanaAddress" : "evmAddress";

    // More thorough check for any existing user with this wallet address
    let existingUser;
    try {
      existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { solanaAddress: address },
            { evmAddress: address },
            { walletAddress: address },
          ],
        },
      });
    } catch (error: any) {
      // Handle prepared statement errors by reconnecting and retrying
      if (
        error.message?.includes("prepared statement") ||
        error.message?.includes("ConnectorError")
      ) {
        console.log("Database connection issue detected, retrying...");
        await prisma.$disconnect();
        await prisma.$connect();
        existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { solanaAddress: address },
              { evmAddress: address },
              { walletAddress: address },
            ],
          },
        });
      } else {
        throw error;
      }
    }

    // If user exists, just return their ID
    if (existingUser) {
      console.log(`User already exists for wallet ${address}, type: ${type}`);

      // Update the wallet-specific field if it's not set
      if (!existingUser[walletField]) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            [walletField]: address,
            [type === "solana" ? "solanaVerified" : "evmVerified"]: true,
          },
        });
        console.log(`Updated existing user with ${type} wallet: ${address}`);
      }

      return existingUser.id;
    }

    // STEP 1: Try to find and merge accounts if needed
    // Check if this wallet address might belong to an existing user with a different wallet type
    const mergedUser = await mergeWalletAccounts(address, type);

    // If accounts were merged, return the merged user result object with all details
    if (mergedUser) {
      console.log(`Merged accounts for ${type} wallet: ${address}`);
      return mergedUser;
    }

    // STEP 2: If no existing user or merge available, create a new user
    // Generate a unique username for the user based on their wallet address
    const username = `ltmex_${address.slice(0, 6)}${Math.floor(
      Math.random() * 10000
    )}`;

    // Generate a unique referral code
    const referralCode = await generateUniqueReferralCode();

    // Check for a referral code in cookies
    let referrerId: string | null = null;
    const storedReferralCode = getCookie("referralCode");

    if (storedReferralCode) {
      referrerId = await validateReferralCode(storedReferralCode);
    }

    // Try-catch approach to handle potential unique constraint errors
    const newUserId = uuidv4();
    console.log(`Attempting to create user with ${type} wallet: ${address}`);

    let user;
    try {
      // Attempt to create a new user
      user = await prisma.user.create({
        data: {
          id: newUserId,
          username,
          walletAddress: address, // Set the primary wallet address
          [walletField]: address, // Set the type-specific wallet address field
          referralCode,
          referrerId,
          walletType: type, // Set the wallet type
          verified: true, // Automatically verify since they've connected a wallet
          [type === "solana" ? "solanaVerified" : "evmVerified"]: true,
        },
      });

      console.log(`Successfully created new user with ID: ${user.id}`);
    } catch (error: any) {
      // If we hit a unique constraint error, find and update the existing user
      if (error?.code === "P2002") {
        console.log(
          `Unique constraint violated, finding existing user for ${address}`
        );

        // Find the existing user again (in case they were just created in a race condition)
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { solanaAddress: address },
              { evmAddress: address },
              { walletAddress: address },
            ],
          },
        });

        if (existingUser) {
          console.log(`Found existing user with ID: ${existingUser.id}`);

          // Update the user with any new information
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              walletAddress: address,
              [walletField]: address,
              walletType: type,
              [type === "solana" ? "solanaVerified" : "evmVerified"]: true,
              verified: true,
            },
          });

          console.log(`Updated existing user with ${type} wallet: ${address}`);
        } else {
          throw new Error(
            `Failed to find or create user for wallet ${address}`
          );
        }
      } else {
        // If it's not a unique constraint error, rethrow it
        throw error;
      }
    }

    console.log(
      `Automatically registered new user with ${type} wallet: ${address}`
    );

    // Apply referral if applicable
    if (referrerId && user.id) {
      await applyReferral(user.id, referrerId);
      console.log(`Applied referral from ${referrerId} to new user ${user.id}`);
    }

    return user.id;
  } catch (error: any) {
    console.error("Error auto-registering user:", error);
    throw error;
  }
}
