"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useAutomaticReferral from "@/components/hooks/useAutomaticReferral";
import { toast } from "sonner"; // Assuming you use sonner for toasts
import { useAccount } from "wagmi";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
/**
 * Component that handles automatic referral application when a user is authenticated
 * This is an invisible component that should be included in layouts where users might log in
 */
export default function AutomaticReferralHandler() {
  const { referralApplied, referralInfo } = useAutomaticReferral();
  const searchParams = useSearchParams();
  const [savedReferralCode, setSavedReferralCode] = useState<string | null>(
    null
  );

  const { connection } = useAppKitConnection();
  const { isConnected: solanaConnected, address: solanaAddress } =
    useAppKitAccount();

  // Get wallet connections
  const { isConnected: evmConnected, address: evmAddress } = useAccount();

  // Create a PublicKey object from the Solana address if available
  // Check if the address is in valid base58 format before creating PublicKey
  const solanaPublicKey = (() => {
    try {
      return solanaAddress &&
        typeof solanaAddress === "string" &&
        solanaAddress.length > 30
        ? new PublicKey(solanaAddress)
        : null;
    } catch (error) {
      console.warn("Invalid Solana address format:", error);
      return null;
    }
  })();

  const isWalletConnected = solanaConnected || evmConnected;
  const walletAddress = solanaAddress || evmAddress || "";

  // Handle referral codes from URL parameters
  useEffect(() => {
    const referralCode =
      searchParams.get("ref") || searchParams.get("referral");

    if (referralCode) {
      // Save the referral code to local storage for later use
      localStorage.setItem("pendingReferralCode", referralCode);
      setSavedReferralCode(referralCode);

      // Only show toast if this is first time seeing the referral code
      if (!sessionStorage.getItem("referralNotified")) {
        toast.info(
          `Referral code ${referralCode} saved. Connect your wallet to apply it.`
        );
        sessionStorage.setItem("referralNotified", "true");
      }
    } else {
      // Check for previously saved referral code
      const saved = localStorage.getItem("pendingReferralCode");
      if (saved) {
        setSavedReferralCode(saved);
      }
    }
  }, [searchParams]);

  // Apply saved referral code when wallet is connected
  useEffect(() => {
    const applyReferralCode = async () => {
      // Only proceed if wallet is connected and we have a saved code
      if (!isWalletConnected || !savedReferralCode || !walletAddress) return;

      try {
        // Call API to apply the referral to the user
        const response = await fetch("/api/referral/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress,
            referralCode: savedReferralCode,
          }),
        });

        if (response.ok) {
          toast.success(
            `Referral code ${savedReferralCode} applied successfully!`
          );

          // Clear the pending referral code since it's now applied
          localStorage.removeItem("pendingReferralCode");
          setSavedReferralCode(null);
        }
      } catch (error) {
        console.error("Error applying referral code:", error);
      }
    };

    applyReferralCode();
  }, [isWalletConnected, savedReferralCode, walletAddress]);

  // Show a notification when a referral is successfully applied (from the hook)
  useEffect(() => {
    if (referralApplied && referralInfo.referrerUsername) {
      toast.success(
        `Referral from ${referralInfo.referrerUsername} has been applied to your account!`
      );
    } else if (referralApplied) {
      toast.success("Referral has been applied to your account!");
    }
  }, [referralApplied, referralInfo]);

  // No visible UI - this component just handles the referral application
  return null;
}
