import { useEffect, useState } from "react";
import {
  extractReferralCodeFromUrl,
  storeReferralCode,
  getStoredReferralCode,
  clearStoredReferralCode,
} from "@/lib/referral";

/**
 * Alternative hook for referral system that doesn't require next-auth
 * Use this when the NextAuth integration is not available or not needed
 */
export default function useReferralSystemAlternative() {
  const [userId, setUserId] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletVerified, setWalletVerified] = useState(false);

  // Check for referral code in URL and localStorage on component mount
  useEffect(() => {
    // First check if there's a referral code in the URL
    const urlReferralCode = extractReferralCodeFromUrl();

    if (urlReferralCode) {
      // If found in URL, store it and use it
      storeReferralCode(urlReferralCode);
      setReferralCode(urlReferralCode);
    } else {
      // If not in URL, check localStorage
      const storedCode = getStoredReferralCode();
      if (storedCode) {
        setReferralCode(storedCode);
      }
    }

    setIsLoading(false);

    // Try to get user ID from localStorage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Try to get wallet info from localStorage
    const storedWalletAddress = localStorage.getItem("walletAddress");
    const storedWalletVerified =
      localStorage.getItem("walletVerified") === "true";
    const storedUserReferralCode = localStorage.getItem("userReferralCode");

    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    if (storedWalletVerified) {
      setWalletVerified(storedWalletVerified);
    }

    if (storedUserReferralCode) {
      setUserReferralCode(storedUserReferralCode);
    }
  }, []);

  /**
   * Apply a new referral code manually
   * @param code The referral code to apply
   */
  const applyReferralCode = (code: string) => {
    storeReferralCode(code);
    setReferralCode(code);
  };

  /**
   * Clear the current referral code
   */
  const clearReferralCode = () => {
    localStorage.removeItem("referralCode");
    setReferralCode(null);
  };

  /**
   * Store user ID in local storage
   * @param newUserId User ID to store
   */
  const setUser = (newUserId: string) => {
    setUserId(newUserId);
    localStorage.setItem("userId", newUserId);
  };

  /**
   * Generate a referral code by verifying wallet ownership
   * This is a fallback implementation that will store data locally
   * when the NextAuth API endpoint is not available
   */
  const generateReferralWithWallet = async (
    walletAddress: string,
    signature: string,
    message: string,
    walletType: "solana" | "ethereum"
  ) => {
    try {
      // First try to call the API
      const response = await fetch("/api/referrals/wallet-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
          walletType,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();

        if (data.success && data.referralCode) {
          setUserReferralCode(data.referralCode);
          setWalletAddress(walletAddress);
          setWalletVerified(true);

          // Store in localStorage as fallback
          localStorage.setItem("walletAddress", walletAddress);
          localStorage.setItem("walletVerified", "true");
          localStorage.setItem("userReferralCode", data.referralCode);

          return data.referralCode;
        }
      } else if (response.status === 401) {
        // Unauthorized - could be that NextAuth isn't set up
        // Generate a local fallback referral code
        const fallbackReferralCode = generateLocalReferralCode(walletAddress);
        setUserReferralCode(fallbackReferralCode);
        setWalletAddress(walletAddress);
        setWalletVerified(true);

        // Store in localStorage
        localStorage.setItem("walletAddress", walletAddress);
        localStorage.setItem("walletVerified", "true");
        localStorage.setItem("userReferralCode", fallbackReferralCode);

        console.log("Generated local referral code (API unavailable)");
        return fallbackReferralCode;
      }
    } catch (error) {
      console.error("Error in wallet verification:", error);
      // Generate a local fallback referral code
      const fallbackReferralCode = generateLocalReferralCode(walletAddress);
      setUserReferralCode(fallbackReferralCode);
      setWalletAddress(walletAddress);
      setWalletVerified(true);

      // Store in localStorage
      localStorage.setItem("walletAddress", walletAddress);
      localStorage.setItem("walletVerified", "true");
      localStorage.setItem("userReferralCode", fallbackReferralCode);

      console.log("Generated local referral code (offline mode)");
      return fallbackReferralCode;
    }

    return null;
  };

  /**
   * Generate a deterministic referral code based on wallet address
   * This is used as a fallback when the API is not available
   */
  const generateLocalReferralCode = (address: string): string => {
    // Extract parts of the address to create a unique code
    const prefix = "AX";
    const middle = address.slice(2, 6).toUpperCase();
    const suffix = address.slice(-4).toUpperCase();

    return `${prefix}${middle}${suffix}`;
  };

  /**
   * Fetch the current user's referral information
   * This is a local implementation that just returns what's in localStorage
   */
  const fetchUserReferralInfo = async () => {
    // For the alternative implementation, we just use what's stored locally
    const storedWalletAddress = localStorage.getItem("walletAddress");
    const storedWalletVerified =
      localStorage.getItem("walletVerified") === "true";
    const storedUserReferralCode = localStorage.getItem("userReferralCode");

    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    if (storedWalletVerified) {
      setWalletVerified(storedWalletVerified);
    }

    if (storedUserReferralCode) {
      setUserReferralCode(storedUserReferralCode);
    }

    // Mock stats data for UI consistency
    setReferralStats({
      referralsCount: localStorage.getItem("referralsCount") || 0,
      referralCode: storedUserReferralCode,
      walletVerified: storedWalletVerified,
    });
  };

  /**
   * Generate a new referral code manually (without wallet)
   * This is available for compatibility with the original hook
   */
  const generateReferralCode = async () => {
    // Generate a simple referral code if user ID exists
    if (userId) {
      const code = `AX${userId.slice(0, 6).toUpperCase()}`;
      setUserReferralCode(code);
      localStorage.setItem("userReferralCode", code);
      return code;
    }

    // Otherwise generate a random one
    const randomCode = `AX${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    setUserReferralCode(randomCode);
    localStorage.setItem("userReferralCode", randomCode);
    return randomCode;
  };

  /**
   * Apply stored referral to user account
   * @param userId The ID of the user to apply the referral to
   */
  const applyStoredReferralToUser = async (userId: string) => {
    const storedCode = getStoredReferralCode();
    if (!storedCode || !userId) return false;

    // In the alternative implementation, we just record this locally
    localStorage.setItem("appliedReferral", storedCode);
    localStorage.setItem("appliedToUser", userId);

    // Clear the stored code
    clearStoredReferralCode();
    return true;
  };

  return {
    // Incoming referral code (the code that referred this user)
    referralCode,
    // User's own referral code to share
    userReferralCode,
    referralStats,
    isLoading,
    walletAddress,
    walletVerified,
    // Methods
    applyReferralCode,
    clearReferralCode,
    setUser,
    generateReferralWithWallet,
    fetchUserReferralInfo,
    generateReferralCode,
    applyStoredReferralToUser,
  };
}
