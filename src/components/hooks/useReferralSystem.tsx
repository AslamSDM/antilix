import { useEffect, useState } from "react";
import {
  extractReferralCodeFromUrl,
  storeReferralCode,
  getStoredReferralCode,
  clearStoredReferralCode,
} from "@/lib/referral";
import type { Session } from "next-auth";

// Safely import useSession from next-auth/react
let useSessionImport: any;

try {
  useSessionImport = require("next-auth/react");
} catch (error) {
  console.warn(
    "next-auth/react could not be imported, using fallback session implementation"
  );
  useSessionImport = {
    useSession: () => ({
      data: null,
      status: "unauthenticated",
    }),
  };
}

const { useSession } = useSessionImport;

/**
 * Hook to handle referral code detection, storage, and management
 * @returns Object containing referral code state and methods
 */
export default function useReferralSystem() {
  // Get session from next-auth if available
  const { data: session, status } = useSession();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
   * Fetch the current user's referral information from the server
   */
  const fetchUserReferralInfo = async () => {
    if (!session?.user?.walletAddress) return;

    try {
      const response = await fetch("/api/referrals");
      const data = await response.json();

      if (data.referralCode) {
        setUserReferralCode(data.referralCode);
      }

      setReferralStats(data);
    } catch (error) {
      console.error("Error fetching referral info:", error);
    }
  };

  /**
   * Generate a new referral code for the current user
   */
  const generateReferralCode = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.referralCode) {
        setUserReferralCode(data.referralCode);
        return data.referralCode;
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
    return null;
  };

  // Fetch user's referral info when session changes
  useEffect(() => {
    if (session?.user) {
      fetchUserReferralInfo();
    }
  }, [session?.user]);

  /**
   * Generate a referral code by verifying wallet ownership
   * @param walletAddress The wallet address (public key as string)
   * @param signature The signature as a base58 encoded string
   * @param message The original message that was signed
   * @param walletType The type of wallet (solana or ethereum)
   */
  const generateReferralWithWallet = async (
    walletAddress: string,
    signature: string,
    message: string,
    walletType: "solana" | "ethereum"
  ) => {
    if (!session?.user) return null;

    try {
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

      const data = await response.json();

      if (data.success && data.referralCode) {
        setUserReferralCode(data.referralCode);
        return data.referralCode;
      } else {
        console.error("Error verifying wallet:", data.error);
      }
    } catch (error) {
      console.error("Error in wallet verification:", error);
    }

    return null;
  };

  return {
    // Incoming referral code (the code that referred this user)
    referralCode,
    // User's own referral code to share
    userReferralCode,
    referralStats,
    isLoading,
    // New method for wallet-based referral code generation
    generateReferralWithWallet,
    // Methods
    applyReferralCode,
    clearReferralCode,
    generateReferralCode,
    fetchUserReferralInfo,
  };
}
