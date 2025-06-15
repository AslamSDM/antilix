"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coins, Wallet, Database } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useBscPresale } from "./hooks/useBscPresale";
import { useSolanaPresale } from "./hooks/useSolanaPresale";
import { Skeleton } from "./ui/skeleton";
import { getWalletType } from "./hooks/usePresale";
import { useAppKitState } from "@reown/appkit/react";

export const UserBalanceDisplay = () => {
  const [dbBalance, setDbBalance] = useState<number | null>(null);
  const [contractBalance, setContractBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const appKitState = useAppKitState();
  const appkitAccountData = useAppKitAccount();
  const { isConnected: connected } = appkitAccountData || { connected: false };
  const walletAddress = appkitAccountData?.address;
  const walletType = getWalletType(appKitState, {
    isConnected: connected,
    caipAddress: appkitAccountData?.caipAddress,
  });

  // Get balances from respective hooks based on wallet type
  const { userBalance } = useBscPresale(0);
  // const { getUserBalance: getSolanaBalance } = useSolanaPresale();

  // Fetch balance from database
  useEffect(() => {
    async function fetchDbBalance() {
      if (!walletAddress) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/user/balance?walletAddress=${walletAddress}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch balance from database");
        }

        const data = await response.json();
        setDbBalance(data.dbBalance || 0);
      } catch (err) {
        console.error("Error fetching DB balance:", err);
        setError("Failed to load balance from database");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDbBalance();
  }, [walletAddress]);

  // Fetch balance from blockchain contract
  useEffect(() => {
    async function fetchContractBalance() {
      if (!walletAddress || !connected) return;

      try {
        setIsLoading(true);

        let balance = userBalance;

        setContractBalance(balance || 0);
      } catch (err) {
        console.error("Error fetching contract balance:", err);
        setError("Failed to load balance from blockchain");
      } finally {
        setIsLoading(false);
      }
    }

    if (connected && walletAddress) {
      fetchContractBalance();
    }
  }, [walletAddress, connected, walletType]);

  // Determine the effective balance (maximum of DB or contract balance)
  const effectiveBalance = Math.max(dbBalance || 0, contractBalance || 0);

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
          <div className="p-4 bg-black/40 border border-primary/20 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-primary mr-2" />
              <span className="text-white/80">Database Balance</span>
            </div>
            <div className="text-primary font-medium">
              {isLoading ? (
                <Skeleton className="h-6 w-16 bg-primary/10" />
              ) : (
                <motion.span
                  key={`db-${dbBalance}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {dbBalance?.toLocaleString() || "0"} LMX
                </motion.span>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/40 border border-primary/20 rounded-md flex justify-between items-center">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-primary mr-2" />
              <span className="text-white/80">Contract Balance</span>
            </div>
            <div className="text-primary font-medium">
              {isLoading || !connected ? (
                <Skeleton className="h-6 w-16 bg-primary/10" />
              ) : (
                <motion.span
                  key={`contract-${contractBalance}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {contractBalance?.toLocaleString() || "0"} LMX
                </motion.span>
              )}
            </div>
          </div>

          <div className="p-4 bg-black/30 border border-primary/30 rounded-md flex justify-between items-center bg-gradient-to-r from-black/40 to-primary/5">
            <div className="flex items-center">
              <Coins className="h-5 w-5 text-primary mr-2" />
              <span className="text-white font-medium">Effective Balance</span>
            </div>
            <div className="text-primary font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-20 bg-primary/10" />
              ) : (
                <motion.span
                  key={`effective-${effectiveBalance}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-lg"
                >
                  {effectiveBalance.toLocaleString()} LMX
                </motion.span>
              )}
            </div>
          </div>

          <p className="text-sm text-white/60 italic">
            Your effective balance is the higher value from either the database
            or contract balance.
          </p>
        </div>
      )}
    </div>
  );
};
