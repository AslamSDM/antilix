"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useReferralHandling from "./useReferralHandling";

/**
 * Hook that automatically applies stored referral codes when a user is authenticated
 * This should be used in components that are rendered when a user logs in or signs up
 */
export default function useAutomaticReferral() {
  const { data: session, status } = useSession();
  const referralInfo = useReferralHandling();
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const applyReferralIfAuthenticated = async () => {
      // Only proceed if:
      // 1. Referral hasn't been applied yet
      // 2. We're not currently in the process of applying it
      // 3. User is authenticated
      // 4. We have a valid referral code
      if (
        !applied &&
        !isApplying &&
        status === "authenticated" &&
        session?.user &&
        referralInfo.isValid &&
        referralInfo.code
      ) {
        setIsApplying(true);

        try {
          // Get the user ID from the session
          const userId = (session.user as any).id || session.user.email;

          if (userId) {
            const success = await referralInfo.applyReferral(userId);
            if (success) {
              console.log(
                `✅ Referral successfully applied: ${referralInfo.code} → ${userId}`
              );
              setApplied(true);
            } else {
              console.warn(
                `⚠️ Failed to apply referral: ${referralInfo.code} → ${userId}`
              );
            }
          }
        } catch (error) {
          console.error("Error applying referral automatically:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Unknown error applying referral"
          );
        } finally {
          setIsApplying(false);
        }
      }
    };

    applyReferralIfAuthenticated();
  }, [session, status, referralInfo, applied, isApplying]);

  return {
    referralApplied: applied,
    isApplyingReferral: isApplying,
    referralError: error,
    referralInfo,
  };
}
