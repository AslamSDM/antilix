"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface ReferralIndicatorProps {
  referralCode?: string;
  referrerUsername?: string | null;
}

export default function ReferralIndicator({
  referralCode: propReferralCode,
  referrerUsername: propReferrerUsername,
}: ReferralIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(
    propReferralCode || null
  );
  const [referrerUsername, setReferrerUsername] = useState<string | null>(
    propReferrerUsername || null
  );
  const { status, data: session } = useSession();

  const { connected: solanaConnected } = useWallet();
  const { isConnected: evmConnected } = useAccount();
  const searchParams = useSearchParams();

  const isWalletConnected = solanaConnected || evmConnected;

  // Check for referral codes in URL or localStorage
  useEffect(() => {
    console.log("ReferralIndicator mounted", status, session);
    if (status !== "authenticated") return;
    if (session?.user?.referralCode) return;
    // Check URL parameters first
    const urlRefCode = searchParams.get("ref") || searchParams.get("referral");

    if (urlRefCode) {
      setReferralCode(urlRefCode);
      setVisible(true);

      // Store the referral code in both localStorage and cookie
      localStorage.setItem("pendingReferralCode", urlRefCode);

      // Set cookie with 30 days expiration
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      document.cookie = `pendingReferralCode=${urlRefCode}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

      // Fetch referrer info if available
      fetchReferrerInfo(urlRefCode);
    }
    // Otherwise check localStorage and cookies
    else {
      const savedRefCode = localStorage.getItem("pendingReferralCode");

      // Function to get cookie value
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
        return null;
      };

      const cookieRefCode = getCookie("pendingReferralCode");

      const refCode = savedRefCode || cookieRefCode;

      if (refCode) {
        setReferralCode(refCode);
        setVisible(true);
        fetchReferrerInfo(refCode);
      }
    }
  }, [searchParams]);

  // Fetch referrer info on component mount if there's a referral code but no username yet
  useEffect(() => {
    if (referralCode && !referrerUsername) {
      fetchReferrerInfo(referralCode);
    }
  }, [referralCode, referrerUsername]);

  // Fetch info about the referrer
  const fetchReferrerInfo = async (code: string) => {
    try {
      const response = await fetch(`/api/referral/info?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        if (data.referrerInfo.username) {
          setReferrerUsername(data.referrerInfo.username);
        }
      }
    } catch (error) {
      console.error("Error fetching referrer info:", error);
    }
  };

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Allow manual dismissal
  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-primary/10 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
        >
          <div>
            <p className="text-sm text-white/90">
              <span className="font-medium">Referral Active:</span>{" "}
              {referrerUsername ? (
                <>Referred by {referrerUsername}</>
              ) : (
                <>Code: {referralCode}</>
              )}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-3 bg-transparent text-white/70 hover:text-white"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
