"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Wallet, X } from "lucide-react";
import { WalletConnectModal } from "./WalletConnectModal";
import usePresale from "@/components/hooks/usePresale";
import { useAppKit } from "@reown/appkit/react";
import { useDisconnect } from "@reown/appkit/react";
import { toast } from "sonner";

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
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Get wallet info from usePresale hook
  const { connected, walletAddress, currentWalletType, switchNetwork } =
    usePresale();
  const { open, close } = useAppKit();
  const { disconnect } = useDisconnect();

  const solanaConnected = connected && currentWalletType === "solana";
  const ethereumConnected = connected && currentWalletType === "bsc";

  // Handle wallet disconnect
  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Error disconnecting wallet. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Handle connection
  const handleConnect = (type?: "ethereum" | "solana") => {
    setIsModalOpen(true);

    // Update the network in usePresale if specified
    if (type === "ethereum") {
      switchNetwork("bsc");
    } else if (type === "solana") {
      switchNetwork("solana");
    }

    // Open the connection modal
    open();

    // Call onConnect callback if provided
    if (typeof onConnect === "function" && type) {
      onConnect(type);
    }
  };

  // Monitor connection state
  useEffect(() => {
    if (connected && isModalOpen) {
      setIsModalOpen(false);
      close();
      toast.success(
        `${currentWalletType?.toUpperCase() || "Wallet"} connected successfully`
      );
    }
  }, [connected, currentWalletType, isModalOpen, close]);

  // Format wallet address for display
  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  return (
    <>
      <div className={cn("relative", className)}>
        {connected ? (
          // Connected state - show wallet info
          <Button
            variant={variant === "fancy" ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              variant === "fancy" &&
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none",
              className
            )}
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            <Wallet size={16} />
            <span>
              {isDisconnecting
                ? "Disconnecting..."
                : currentWalletType === "solana"
                ? `Solana: ${displayAddress}`
                : currentWalletType === "bsc"
                ? `BSC: ${displayAddress}`
                : "Wallet Connected"}
            </span>
            {!isDisconnecting && (
              <>
                {solanaConnected && (
                  <div className="px-2 py-0.5 rounded bg-purple-500/20 text-xs ml-2">
                    SOL
                  </div>
                )}
                {ethereumConnected && (
                  <div className="px-2 py-0.5 rounded bg-amber-500/20 text-xs ml-2">
                    BSC
                  </div>
                )}
                <X size={16} className="ml-2 opacity-70" />
              </>
            )}
          </Button>
        ) : (
          // Not connected - show connect button
          <Button
            variant={variant === "fancy" ? "default" : "outline"}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              variant === "fancy" &&
                "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none",
              className
            )}
            onClick={() => handleConnect()}
          >
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </Button>
        )}
      </div>

      <WalletConnectModal
        isOpen={isModalOpen}
        onCloseAction={() => {
          setIsModalOpen(false);
          close();
        }}
      />
    </>
  );
};
