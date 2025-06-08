"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useReferralSystem from "./hooks/useReferralSystem";
import useReferralSystemAlternative from "./hooks/useReferralSystemAlternative";
import { generateReferralUrl } from "@/lib/referral";
import { WalletReferralButton } from "./WalletReferralButton";
import { WalletSelectorButton } from "./WalletSelectorButton";
import { useEthereumWallet } from "./providers/wallet-provider";

interface ReferralManagementProps {
  className?: string;
}

const ReferralManagement: React.FC<ReferralManagementProps> = ({
  className = "",
}) => {
  // Try to use the NextAuth based hook, fallback to alternative if it fails
  const [usingAlternative, setUsingAlternative] = useState(false);
  const nextAuthReferral = useReferralSystem();
  const alternativeReferral = useReferralSystemAlternative();
  // const { connected: solanaConnected, publicKey } = useWallet();
  const { solanaConnected, publicKey } = {
    solanaConnected: false,
    publicKey: "null",
  }; // Mocked for example
  const { isConnected: ethereumConnected } = useEthereumWallet();

  const walletConnected = solanaConnected || ethereumConnected;

  // Select which implementation to use
  const referralSystem = usingAlternative
    ? alternativeReferral
    : nextAuthReferral;

  const {
    userReferralCode,
    referralStats,
    generateReferralCode,
    fetchUserReferralInfo,
  } = referralSystem;

  // Handle wallet connection
  const handleWalletConnect = (type: "ethereum" | "solana") => {
    console.log(`${type} wallet connected in ReferralManagement`);
  };

  // Fall back to alternative implementation if there's an error
  useEffect(() => {
    try {
      fetchUserReferralInfo();
    } catch (error) {
      console.warn(
        "Falling back to alternative referral system implementation"
      );
      setUsingAlternative(true);
    }
  }, []);

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Ensure we have fresh data when component mounts
  useEffect(() => {
    fetchUserReferralInfo();
  }, [fetchUserReferralInfo]);

  const handleGenerateReferralCode = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const code = await generateReferralCode();
      if (code) {
        setCopied(false);
      }
    } catch (error) {
      console.error("Error generating code:", error);
      // If there's an error with NextAuth implementation, switch to alternative
      setUsingAlternative(true);
      try {
        // Try again with the alternative implementation
        await alternativeReferral.generateReferralCode();
      } catch (fallbackError) {
        console.error("Error with fallback implementation:", fallbackError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyReferralLink = () => {
    if (!userReferralCode) return;

    const referralLink = generateReferralUrl(userReferralCode);
    navigator.clipboard.writeText(referralLink);
    setCopied(true);

    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleShareReferralLink = () => {
    if (!userReferralCode) return;

    const referralLink = generateReferralUrl(userReferralCode);

    if (navigator.share) {
      navigator.share({
        title: "Join Antilix with my referral link!",
        text: "Use my referral code to sign up for Antilix",
        url: referralLink,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyReferralLink();
    }
  };

  return (
    <div className={`bg-black/30 backdrop-blur-md rounded-xl p-6 ${className}`}>
      <h2 className="text-2xl font-semibold text-white mb-4">
        Referral Program
      </h2>

      {!userReferralCode ? (
        <div className="flex flex-col items-center py-6">
          <p className="text-gray-300 mb-4">
            Generate your unique referral code to start earning rewards!
          </p>

          <div className="flex flex-col w-full gap-5">
            {/* Option 1: Connect with wallet for verification */}
            <div className="bg-black/40 rounded-lg p-4">
              <h3 className="text-white text-lg mb-3 text-center">
                Option 1: Verify with Wallet
              </h3>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Sign a message with your blockchain wallet to verify ownership
                and generate a referral code.
              </p>
              {walletConnected ? (
                <WalletReferralButton className="w-full" />
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-amber-400 text-sm text-center">
                    Connect your wallet first to enable verification
                  </p>
                  <WalletSelectorButton
                    className="w-full"
                    variant="fancy"
                    onConnect={handleWalletConnect}
                  />
                </div>
              )}
            </div>

            {/* Option 2: Standard generation without wallet */}
            <div className="bg-black/40 rounded-lg p-4">
              <h3 className="text-white text-lg mb-3 text-center">
                Option 2: Standard Generation
              </h3>
              <p className="text-gray-300 text-sm mb-4 text-center">
                Generate a referral code without wallet verification.
              </p>
              <button
                onClick={handleGenerateReferralCode}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-500 w-full text-white px-4 py-2 rounded-md hover:opacity-90 transition disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate Referral Code"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Your referral code:</p>
            <div className="flex items-center gap-4">
              <div className="bg-black/40 text-white text-xl font-mono px-4 py-2 rounded-md flex-grow text-center">
                {userReferralCode}
              </div>
              <button
                onClick={handleCopyReferralLink}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-md transition"
                title="Copy referral link"
              >
                {copied ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span>📋</span>
                )}
              </button>
              <button
                onClick={handleShareReferralLink}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-md transition"
                title="Share referral link"
              >
                <span>🔗</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-black/20 p-4 rounded-md">
              <p className="text-sm text-gray-400">Total Referrals</p>
              <p className="text-2xl font-semibold text-white">
                {referralStats?.referralCount || 0}
              </p>
            </div>

            <div className="bg-black/20 p-4 rounded-md">
              <p className="text-sm text-gray-400">Rewards Earned</p>
              <p className="text-2xl font-semibold text-white">
                {/* You can implement a rewards calculation based on referralStats */}
                {(referralStats?.referralCount || 0) * 50} XP
              </p>
            </div>
          </div>

          {referralStats?.referrals && referralStats.referrals.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">
                Your Referrals
              </h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {referralStats.referrals.map((referral: any) => (
                  <li
                    key={referral.id}
                    className="bg-black/20 p-2 rounded flex justify-between"
                  >
                    <span className="text-white truncate">
                      {referral.username || referral.email || "Anonymous"}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6 text-center py-4 bg-black/20 rounded-md">
              <p className="text-gray-400">
                No referrals yet. Share your code to start earning!
              </p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-2">
              How it works
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-300">
              <li>Share your referral code with friends</li>
              <li>They sign up using your referral link</li>
              <li>Earn rewards when they join Antilix</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralManagement;
