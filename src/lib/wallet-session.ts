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
    console.log(
      `Creating wallet session for userId: ${userId}, address: ${address}, type: ${walletType}`
    );

    // Sign in the user with the credentials provider
    // We pass just the userId and let the server handle looking up any additional user data
    const result = await signIn("credentials", {
      redirect: false,
      userId,
      wallet: address,
      walletType,
      callbackUrl: "/profile",
    });

    if (!result?.ok) {
      console.error("NextAuth signIn failed with result:", result);
      return false;
    }

    // Try to update the session data client-side if possible
    try {
      // Import useSession dynamically to avoid SSR issues
      const { useSession } = await import("next-auth/react");
      const session = useSession();

      if (session && typeof session.update === "function") {
        await session.update({
          user: {
            ...session.data?.user,
            walletAddress: address,
            walletType,
            walletVerified: true,
            ...(walletType === "solana"
              ? { solanaAddress: address, solanaVerified: true }
              : {}),
            ...(walletType === "ethereum" || walletType === "bsc"
              ? { evmAddress: address, evmVerified: true }
              : {}),
          },
        });
      }
    } catch (updateError) {
      console.warn("Could not update session client-side:", updateError);
      // Not critical, the session will be updated on next navigation or refresh
    }

    return true;
  } catch (error) {
    console.error("Failed to create wallet session:", error);
    return false;
  }
}
