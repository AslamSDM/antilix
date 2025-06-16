import { useState, useEffect } from "react";
import { extractReferralCodeFromUrl } from "@/lib/referral";
import { setCookie, getCookie } from "@/lib/cookies";

interface ReferralInfo {
  code: string | null;
  referrerId: string | null;
  referrerAddress: string | null;
  referrerUsername: string | null;
  isValid: boolean;
}

/**
 * Hook to handle referral code processing from URL and store in cookies
 * @returns Object containing referral state and methods
 */
export default function useReferralHandling(): ReferralInfo {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [referrerAddress, setReferrerAddress] = useState<string | null>(null);
  const [referrerUsername, setReferrerUsername] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  // Check for referral code in URL and process it
  useEffect(() => {
    const processReferralCode = async () => {
      try {
        // Extract referral code from URL
        const code = extractReferralCodeFromUrl();

        // If no code in URL, check if we already have one in cookies
        if (!code) {
          const savedCode = getCookie("referralCode");
          const savedReferrerId = getCookie("referrerId");
          const savedReferrerAddress = getCookie("referrerAddress");
          const savedReferrerUsername = getCookie("referrerUsername");
          const savedIsValid = getCookie("referralIsValid");

          if (savedCode) {
            setReferralCode(savedCode);
            if (savedReferrerId) setReferrerId(savedReferrerId);
            if (savedReferrerAddress) setReferrerAddress(savedReferrerAddress);
            if (savedReferrerUsername)
              setReferrerUsername(savedReferrerUsername);
            setIsValid(savedIsValid === "true");
          }
          return;
        }

        // If we found a code in the URL, store it in cookies and state
        setReferralCode(code);
        setCookie("referralCode", code, 30); // Store for 30 days

        // Fetch referrer details from API
        try {
          const response = await fetch(`/api/referrals/info?code=${code}`);
          const data = await response.json();

          if (data.success) {
            setReferrerId(data.referrerId);
            setReferrerAddress(data.walletAddress);
            setReferrerUsername(data.username);
            setIsValid(true);

            // Store in cookies
            setCookie("referrerId", data.referrerId, 30);
            if (data.walletAddress)
              setCookie("referrerAddress", data.walletAddress, 30);
            if (data.username) setCookie("referrerUsername", data.username, 30);
            setCookie("referralIsValid", "true", 30);

            console.log(
              `Referral code validated: ${code}, Referrer: ${
                data.username || data.referrerId
              }`
            );
          } else {
            setIsValid(false);
            setCookie("referralIsValid", "false", 30);
            console.warn(`Invalid referral code in URL: ${code}`);
          }
        } catch (error) {
          console.error("Error fetching referrer info:", error);
          setIsValid(false);
          setCookie("referralIsValid", "false", 30);
        }
      } catch (error) {
        console.error("Error handling referral code:", error);
      }
    };

    // Only process referral in browser environment
    if (typeof window !== "undefined") {
      processReferralCode();
    }
  }, []);

  return {
    code: referralCode,
    referrerId,
    referrerAddress,
    referrerUsername,
    isValid,
  };
}
