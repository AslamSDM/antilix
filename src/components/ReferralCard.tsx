"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Users } from "lucide-react";
import LuxuryCard from "./LuxuryCard";
import { generateReferralUrl } from "@/lib/referral";
import useReferralSystem from "./hooks/useReferralSystem";

interface ReferralCardProps {
  className?: string;
}

export const ReferralCard: React.FC<ReferralCardProps> = ({
  className = "",
}) => {
  const {
    userReferralCode,
    referralStats,
    isLoading: referralLoading,
    generateReferralCode,
    fetchUserReferralInfo,
  } = useReferralSystem();

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bonusStats, setBonusStats] = useState({
    totalBonus: "0",
    count: 0,
    referralCount: 0,
  });

  // Ensure we have fresh data
  useEffect(() => {
    fetchUserReferralInfo();

    // Fetch referral bonus data if we have a wallet connected
    const fetchBonusData = async () => {
      if (!userReferralCode) return;

      try {
        const response = await fetch(
          `/api/referral/bonuses?referralCode=${userReferralCode}`
        );
        if (response.ok) {
          const data = await response.json();
          setBonusStats({
            totalBonus: data.totalBonus || "0",
            count: data.count || 0,
            referralCount: data.referralCount || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching referral bonus data:", error);
      }
    };

    fetchBonusData();
  }, [fetchUserReferralInfo, userReferralCode]);

  // If no referral code is provided or fetched, generate a placeholder
  const displayReferralCode =
    userReferralCode ||
    "LMX" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCopyReferralLink = () => {
    const referralLink = generateReferralUrl(displayReferralCode);
    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const referralLink = generateReferralUrl(displayReferralCode);

  return (
    <LuxuryCard className={`p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Share2 className="w-6 h-6 text-primary mr-3" />
        <h3 className="text-xl font-bold">Refer Friends & Earn 5% Bonus</h3>
      </div>

      <p className="text-gray-300 mb-6">
        Share your unique referral link with friends and earn a 5% bonus on
        their contribution. Your friends will also receive a 2.5% bonus!
      </p>

      <div className="relative">
        <div className="flex">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-grow bg-black/50 border border-primary/30 rounded-l-md p-3 text-white/90 focus:outline-none"
          />
          <button
            onClick={handleCopyReferralLink}
            className="bg-primary text-primary-foreground px-4 rounded-r-md hover:bg-primary/90 transition-all flex items-center"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Shimmer effect on the input */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-fast"></div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-black/40 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Total Bonus</div>
          <div className="text-lg font-bold">
            {parseFloat(bonusStats.totalBonus).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            LMX
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Referrals</div>
          <div className="text-lg font-bold">{bonusStats.referralCount}</div>
        </div>

        <div className="bg-black/40 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Purchases</div>
          <div className="text-lg font-bold">{bonusStats.count}</div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <a
          href="/referral"
          className="text-primary hover:text-primary/80 text-sm flex items-center"
        >
          <Users className="w-4 h-4 mr-1" />
          View Detailed Referral Analytics
        </a>
      </div>

      {/* Social sharing options */}
      <div className="flex justify-center mt-6 space-x-4">
        {["Twitter", "Telegram", "Discord"].map((platform, index) => (
          <motion.button
            key={platform}
            className="bg-black/40 border border-primary/20 rounded-md px-4 py-2 text-sm hover:border-primary/50 transition-all"
            whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            Share on {platform}
          </motion.button>
        ))}
      </div>

      {/* Rewards visualization */}
      <div className="mt-6 pt-6 border-t border-primary/20">
        <h4 className="font-medium mb-3 text-center">Your Referral Rewards</h4>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">Total Referred</div>
          <div className="font-medium">0 Users</div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-400">Bonus Earned</div>
          <div className="font-medium text-primary">0 LMX</div>
        </div>
      </div>
    </LuxuryCard>
  );
};

export default ReferralCard;
