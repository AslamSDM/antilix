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
    // Check if a user with this wallet already exists
    const walletField = type === "solana" ? "solanaAddress" : "evmAddress";

    const existingUser = await prisma.user.findFirst({
      where: {
        [walletField]: address,
      },
    });

    // If user exists, just return their ID
    if (existingUser) {
      console.log(`User already exists for ${type} wallet ${address}`);
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

    // Create the new user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
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

    console.log(
      `Automatically registered new user with ${type} wallet: ${address}`
    );

    // Apply referral if applicable
    if (referrerId && user.id) {
      await applyReferral(user.id, referrerId);
      console.log(`Applied referral from ${referrerId} to new user ${user.id}`);
    }

    return user.id;
  } catch (error) {
    console.error("Error auto-registering user:", error);
    throw error;
  }
}
