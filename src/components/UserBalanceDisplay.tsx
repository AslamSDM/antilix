"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { Skeleton } from "./ui/skeleton";

export const UserBalanceDisplay = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appkitAccountData = useAppKitAccount();
  const { isConnected: connected } = appkitAccountData || { connected: false };
  const walletAddress = appkitAccountData?.address;

  // Fetch balance from database
  useEffect(() => {
    async function fetchBalance() {
      if (!walletAddress) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/user/balance?walletAddress=${walletAddress}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }

        const data = await response.json();
        setBalance(data.dbBalance || 0);
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError("Failed to load balance");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [walletAddress]);

  if (!connected) {
    return (
      <div className="text-center py-6">
        <p className="text-white/70">
          Connect your wallet to view your balance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium luxury-text">Your LMX Balance</h3>
        {isLoading && <Skeleton className="h-6 w-20 bg-primary/10" />}
      </div>

      {error ? (
        <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-md text-red-400">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-black/30 border border-primary/30 rounded-md flex justify-between items-center bg-gradient-to-r from-black/40 to-primary/5">
            <div className="flex items-center">
              <Coins className="h-5 w-5 text-primary mr-2" />
              <span className="text-white font-medium">Balance</span>
            </div>
            <div className="text-primary font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-20 bg-primary/10" />
              ) : (
                <motion.span
                  key={`balance-${balance}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-lg"
                >
                  {balance?.toLocaleString() || "0"} LMX
                </motion.span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
