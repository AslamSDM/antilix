import { useState, useEffect } from "react";
import useReferralHandling from "@/components/hooks/useReferralHandling";
import { useSession } from "next-auth/react";

/**
 * Hook to automatically apply referrals when users authenticate
 */
export function useAutomaticReferral() {
  const { data: session, status } = useSession();
  const referralInfo = useReferralHandling();
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const applyReferralIfAuthenticated = async () => {
      // Only proceed if referral not yet applied, user is authenticated, and we have a valid referral
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
          // Get the user ID from the session - this may be stored differently depending on your auth setup
          const userId = (session.user as any).id || session.user.email;
          if (userId) {
            const success = await referralInfo.applyReferral(userId);
            if (success) {
              console.log(`Referral successfully applied to user: ${userId}`);
              setApplied(true);
            }
          }
        } catch (error) {
          console.error("Error applying referral:", error);
          setError("Failed to apply referral");
        } finally {
          setIsApplying(false);
        }
      }
    };

    applyReferralIfAuthenticated();
  }, [session, status, referralInfo, applied, isApplying]);

  return {
    applied,
    isApplying,
    error,
  };
}

/**
 * Apply a referral code manually for a specific user ID
 * Useful when callback functions are needed rather than hooks
 */
export async function applyReferralToUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    // Get the referral code from storage (cookies)
    const referralCode = document.cookie
      .split("; ")
      .find((row) => row.startsWith("referralCode="))
      ?.split("=")[1];

    if (!referralCode) return false;

    // Call the API to apply the referral
    const response = await fetch("/api/referrals/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        referralCode,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Clear the cookies since it's been applied
      document.cookie =
        "referralCode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie =
        "referrerId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie =
        "referrerAddress=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie =
        "referrerUsername=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie =
        "referralIsValid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error applying referral:", error);
    return false;
  }
}
