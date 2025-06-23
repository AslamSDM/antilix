import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  hash: string;
  status: string;
  network: string;
  createdAt: string;
  tokenAmount: string;
  paymentAmount: string;
  paymentCurrency: string;
}

export function PendingTransactions() {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // Fetch pending transactions
  const fetchPendingTransactions = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/presale/pending-transactions");

      if (!response.ok) {
        throw new Error("Failed to fetch pending transactions");
      }

      const data = await response.json();
      setPendingTransactions(data.pendingTransactions);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for pending transactions every 15 seconds
  useEffect(() => {
    if (!session) return;

    fetchPendingTransactions();
  }, [session]);

  // If no transactions or loading, don't show anything
  if (isLoading && pendingTransactions.length === 0) {
    return null;
  }

  // If no pending transactions, don't show anything
  if (pendingTransactions.length === 0) {
    return null;
  }

  return (
    <div className="w-full p-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg mt-4">
      <h3 className="text-lg font-medium text-white mb-2">
        Pending Transactions
      </h3>
      <div className="space-y-2">
        {pendingTransactions.map((tx) => (
          <div key={tx.id} className="flex flex-col p-3 bg-white/5 rounded-md">
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Transaction Hash:</span>
              <a
                href={`${tx.network === "BSC" ? "https://bscscan.com/tx/" : "https://solscan.io/tx/"}${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 truncate max-w-[200px]"
              >
                {tx.hash.substring(0, 10)}...
                {tx.hash.substring(tx.hash.length - 8)}
              </a>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Status:</span>
              <span className="text-sm font-medium text-yellow-400">
                Pending Verification
                <span className="ml-1 animate-pulse">...</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Network:</span>
              <span className="text-sm text-white">{tx.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Submitted:</span>
              <span className="text-sm text-white">
                {new Date(tx.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
