"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";

type ReferralStats = {
  totalBonus: string;
  referralCount: number;
  referralCode: string;
};

export default function ReferralStats() {
  const { connected, publicKey } = useWallet();
  const { address } = useAccount();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Get the current wallet address from either Solana or EVM wallet
  const currentWalletAddress = publicKey?.toBase58() || address || "";

  // Fetch referral stats for the current wallet
  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!currentWalletAddress) return;

      setLoading(true);

      try {
        const response = await fetch(
          `/api/referral/bonuses?walletAddress=${currentWalletAddress}`
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalBonus: data.totalBonus,
            referralCount: data.referralCount,
            referralCode: data.referralCode,
          });
        }
      } catch (err) {
        console.error("Error fetching referral stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [currentWalletAddress]);

  // Copy referral code to clipboard
  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      alert("Referral code copied to clipboard!");
    }
  };

  if (!currentWalletAddress || !stats) {
    return null;
  }

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">Your Referral Code</h3>
        <button
          onClick={copyReferralCode}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
        >
          Copy
        </button>
      </div>
      <div className="font-mono text-lg">{stats.referralCode}</div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400">Referrals</div>
          <div className="text-lg font-semibold">{stats.referralCount}</div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400">Earned</div>
          <div className="text-lg font-semibold">
            {parseFloat(stats.totalBonus).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            LMX
          </div>
        </div>
      </div>
    </div>
  );
}
