"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { cn } from "@/lib/utils";
import { useEthereumWallet } from "@/components/providers/wallet-provider";

interface WalletConnectProps {
  className?: string;
}

export const WalletConnectButton: React.FC<WalletConnectProps> = ({
  className,
}) => {
  const { connected: solanaConnected } = useWallet();
  const { address, isConnected, connect, disconnect } = useEthereumWallet();
  const [walletType, setWalletType] = useState<"ethereum" | "solana" | null>(
    null
  );
  const [showOptions, setShowOptions] = useState(false);

  // Use the Ethereum connection status from our custom context
  const ethereumConnected = isConnected && !!address;

  // Handle wallet selection
  const handleWalletSelection = (type: "ethereum" | "solana") => {
    setWalletType(type);
    setShowOptions(false);

    // Connect Ethereum wallet using our custom context
    if (type === "ethereum") {
      connect();
    }
  };

  // Handle Ethereum disconnect using our custom context
  const handleEthereumDisconnect = () => {
    disconnect();
  };

  // If already connected to a wallet, show the connected wallet type
  if (solanaConnected || ethereumConnected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {solanaConnected && (
          <div className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary/20 border border-primary/30">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Solana Connected</span>
            <WalletMultiButton />
          </div>
        )}

        {ethereumConnected && (
          <div className="flex items-center gap-2 py-2 px-4 rounded-lg bg-primary/20 border border-primary/30">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span className="truncate max-w-[100px]">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Ethereum Connected"}
            </span>
            <button
              onClick={handleEthereumDisconnect}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={cn(
          "flex items-center gap-2 py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors",
          className
        )}
      >
        <span className="text-sm font-medium">Connect Wallet</span>
      </button>

      {showOptions && (
        <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleWalletSelection("solana")}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span>Solana Wallet</span>
            </button>

            <button
              onClick={() => handleWalletSelection("ethereum")}
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"></div>
              <span>Ethereum Wallet</span>
            </button>
          </div>
        </div>
      )}

      {/* Solana wallet adapter UI will show up when the user selects Solana */}
      {walletType === "solana" && <WalletMultiButton />}

      {/* Ethereum wallet connection using our custom context */}
      {walletType === "ethereum" && !ethereumConnected && (
        <button
          onClick={connect}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-2"
        >
          Connect Ethereum Wallet
        </button>
      )}
    </div>
  );
};
