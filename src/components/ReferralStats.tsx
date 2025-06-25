"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount } from "wagmi";
import { useSession } from "next-auth/react";

type ReferralStats = {
  totalBonus: string;
  totalPendingBonus: string;
  totalUsd: string;
  totalPendingUsd: string;
  referralCount: number;
  referralCode: string;
  solanaVerified: boolean;
  payments: {
    completed: number;
    pending: number;
  };
};

export default function ReferralStats() {
  const { connected, publicKey } = useWallet();
  const { address } = useAccount();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  // Get the current wallet address from either Solana or EVM wallet
  const currentWalletAddress = publicKey?.toBase58() || address || "";

  // Fetch referral stats for the current wallet
  useEffect(() => {
    const fetchReferralStats = async () => {
      if (!currentWalletAddress) return;

      setLoading(true);

      try {
        const response = await fetch(`/api/referral/bonuses`);

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalBonus: data.totalBonus,
            totalPendingBonus: data.totalPendingBonus || "0",
            totalUsd: data.totalUsd || "0",
            totalPendingUsd: data.totalPendingUsd || "0",
            referralCount: data.referralCount,
            referralCode: data.referralCode,
            solanaVerified: data.solanaVerified || false,
            payments: data.payments || { completed: 0, pending: 0 },
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
      <div className="font-mono text-lg">{session?.user.referralCode}</div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400">Referrals</div>
          <div className="text-lg font-semibold">{stats.referralCount}</div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-xs text-gray-400">Earned TRUMP</div>
          <div className="text-lg font-semibold">
            {parseFloat(stats.totalBonus).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <div className="text-xs text-gray-400 mb-1">Earned Value</div>
        <div className="text-sm font-medium">
          $
          {parseFloat(stats.totalUsd).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      </div>

      {parseFloat(stats.totalPendingBonus) > 0 && (
        <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-sm text-yellow-300 font-medium">
              Pending Rewards
            </div>
            {!stats.solanaVerified && (
              <div className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                Verify Wallet
              </div>
            )}
          </div>
          <div className="text-sm">
            <span className="font-semibold">
              {parseFloat(stats.totalPendingBonus).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>{" "}
            TRUMP ($
            {parseFloat(stats.totalPendingUsd).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            )
          </div>
          {!stats.solanaVerified && (
            <div className="text-xs text-yellow-300/70 mt-1">
              Verify your Solana wallet to claim your pending rewards
            </div>
          )}
        </div>
      )}
    </div>
  );
}
