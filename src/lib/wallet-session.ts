import { signIn } from "next-auth/react";

/**
 * Creates a NextAuth session for a user with wallet authentication
 * This function should be called client-side after wallet connection
 * and user auto-registration
 * 
 * @param userId The ID of the user to sign in
 * @param address The wallet address (optional)
 * @param walletType The type of wallet (solana or ethereum)
 * @returns Promise resolving to true if successful
 */
export async function createWalletSession(
  userId: string,
  address?: string,
  walletType?: string
): Promise<boolean> {
  try {
    // Sign in the user with the credentials provider
    // We pass just the userId and let the server handle looking up any additional user data
    const result = await signIn("credentials", {
      redirect: false,
      userId,
      wallet: address,
      walletType,
      callbackUrl: "/profile",
    });
    
    return result?.ok || false;
  } catch (error) {
    console.error("Failed to create wallet session:", error);
    return false;
  }
}

/**
 * Gets user data for a wallet address
 * This is useful when you need to check if a wallet is associated with a user
 *
 * @param address The wallet address to check
 * @param type The wallet type (solana or ethereum)
 * @returns User data if found
 */
export async function getUserByWallet(
  address: string,
  type: "solana" | "ethereum"
): Promise<any | null> {
  try {
    // Call the API endpoint to get user data by wallet
    const response = await fetch("/api/user/get-by-wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        walletType: type,
      }),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to get user by wallet:", error);
    return null;
  }
}
