"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";

type ReferralBonus = {
  id: string;
  bonusAmount: string;
  createdAt: string;
  purchase: {
    createdAt: string;
    lmxTokensAllocated: string;
    user: {
      walletAddress?: string;
      solanaAddress?: string;
      evmAddress?: string;
    };
  };
};

type ReferralStats = {
  bonuses: ReferralBonus[];
  totalBonus: string;
  count: number;
  referralCount: number;
  referralCode: string;
};

export default function ReferralBonuses() {
  const { connected, publicKey } = useWallet();
  const { address } = useAccount();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get the current wallet address from either Solana or EVM wallet
  const currentWalletAddress = publicKey?.toBase58() || address || "";

  // Fetch referral bonuses for the current wallet
  useEffect(() => {
    const fetchReferralBonuses = async () => {
      if (!currentWalletAddress) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/referral/bonuses?walletAddress=${currentWalletAddress}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch referral bonuses");
        }

        const data = await response.json();
        setReferralStats(data);
      } catch (err) {
        console.error("Error fetching referral bonuses:", err);
        setError(
          "Failed to load your referral bonuses. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferralBonuses();
  }, [currentWalletAddress]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format wallet address for display
  const formatWalletAddress = (address?: string) => {
    if (!address) return "";
    return `${address.substring(0, 4)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Get user's wallet address from purchase
  const getWalletAddress = (purchase: ReferralBonus["purchase"]) => {
    return (
      purchase.user.solanaAddress ||
      purchase.user.evmAddress ||
      purchase.user.walletAddress ||
      ""
    );
  };

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    if (referralStats?.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode);
      alert("Referral code copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">Loading your referral bonuses...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!currentWalletAddress) {
    return (
      <div className="p-4 text-center">
        Please connect your wallet to see your referral bonuses.
      </div>
    );
  }

  if (!referralStats) {
    return <div className="p-4 text-center">No referral data found.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Your Referral Stats</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/20 p-4 rounded-lg">
            {/* <p className="text-sm text-gray-300">Total Bonus Earned</p>
            <p className="text-xl font-bold">
              {parseFloat(referralStats.totalBonus).toLocaleString()} LMX
            </p> */}
          </div>

          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-gray-300">Referral Count</p>
            <p className="text-xl font-bold">{referralStats.referralCount}</p>
          </div>

          <div className="bg-black/20 p-4 rounded-lg">
            <p className="text-sm text-gray-300">Successful Purchases</p>
            <p className="text-xl font-bold">{referralStats.count}</p>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Your Referral Code</p>
            <p className="text-xl font-bold">{referralStats.referralCode}</p>
          </div>
          <button
            onClick={copyReferralCode}
            className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Copy Code
          </button>
        </div>
      </div>

      {referralStats.bonuses.length > 0 ? (
        <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Referral Bonus History</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">From</th>
                  <th className="py-2 text-left">Purchase</th>
                  <th className="py-2 text-right">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {referralStats.bonuses.map((bonus) => (
                  <tr key={bonus.id} className="border-b border-gray-800">
                    <td className="py-3">{formatDate(bonus.createdAt)}</td>
                    <td className="py-3">
                      {formatWalletAddress(getWalletAddress(bonus.purchase))}
                    </td>
                    <td className="py-3">
                      {parseFloat(
                        bonus.purchase.lmxTokensAllocated
                      ).toLocaleString()}{" "}
                      LMX
                    </td>
                    <td className="py-3 text-right">
                      {parseFloat(bonus.bonusAmount).toLocaleString()} LMX
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-black/30 backdrop-blur-lg rounded-lg p-6 shadow-lg text-center">
          <p>You haven't earned any referral bonuses yet.</p>
          <p className="mt-2 text-gray-300">
            Share your referral code with friends to start earning!
          </p>
        </div>
      )}
    </div>
  );
}
