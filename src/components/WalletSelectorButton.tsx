"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Wallet, ChevronDown, X } from "lucide-react";
import { WalletConnectModal } from "./WalletConnectModal";

interface WalletSelectorButtonProps {
  className?: string;
  variant?: "default" | "fancy" | "minimal";
  onConnect?: (walletType: "ethereum" | "solana") => void;
}

export const WalletSelectorButton: React.FC<WalletSelectorButtonProps> = ({
  className,
  variant = "default",
  onConnect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const ethereumConnected = false; // Replace with actual logic to check if Ethereum wallet is connected
  const anyWalletConnected = false; // Replace with actual logic to check if any wallet is connected
  const solanaConnected = false; // Replace with actual logic to check if Solana wallet is connected

  // Handle wallet disconnect
  const handleDisconnect = async () => {
    // if (solanaConnected) {
    //   disconnectSolana();
    // }

    // if (ethereumConnected) {
    //   await disconnectEthereum();
    // }

    setShowOptions(false);
  };

  // Get wallet display info
  const getSolanaDisplayAddress = () => {
    // if (solanaConnected && publicKey) {
    //   return `${publicKey.toString().slice(0, 6)}...${publicKey
    //     .toString()
    //     .slice(-4)}`;
    // }
    return null;
  };

  const getEthereumDisplayAddress = () => {
    // if (ethereumConnected && address) {
    //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
    // }
    return null;
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <Button
          variant={variant === "fancy" ? "default" : "outline"}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            variant === "fancy" &&
              "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none",
            className
          )}
          onClick={() => setIsModalOpen(true)}
        >
          <Wallet size={16} />
          <span>
            {anyWalletConnected ? "Wallet Connected" : "Connect Wallet"}
          </span>
          {anyWalletConnected && (
            <div className="flex items-center gap-1 ml-2">
              {solanaConnected && (
                <div className="px-2 py-0.5 rounded bg-purple-500/20 text-xs">
                  SOL
                </div>
              )}
              {ethereumConnected && (
                <div className="px-2 py-0.5 rounded bg-amber-500/20 text-xs">
                  BSC
                </div>
              )}
            </div>
          )}
        </Button>

        {showOptions && (
          <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-lg shadow-lg p-2 z-50 min-w-[180px]">
            <div className="flex flex-col gap-1">
              {solanaConnected && (
                <div className="p-2 text-xs border-b border-border">
                  <div className="text-white/70">Solana:</div>
                  <div className="font-mono">{getSolanaDisplayAddress()}</div>
                </div>
              )}

              {ethereumConnected && (
                <div className="p-2 text-xs border-b border-border">
                  <div className="text-white/70">BSC:</div>
                  <div className="font-mono">{getEthereumDisplayAddress()}</div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-start gap-2 hover:bg-destructive/10 text-destructive"
                onClick={handleDisconnect}
              >
                <X size={14} />
                <span>Disconnect Wallets</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
