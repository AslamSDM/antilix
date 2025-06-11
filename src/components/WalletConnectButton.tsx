"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  useAppKitState,
  useAppKitNetwork,
  useAppKitAccount,
} from "@reown/appkit/react";
import { modal } from "@/components/providers/wallet-provider";

import { Button } from "./ui/button";
import { Wallet, ChevronDown, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface WalletConnectProps {
  className?: string;
  variant?: "default" | "fancy" | "minimal";
  onConnect?: (walletType: "ethereum" | "solana") => void; // This might need re-evaluation based on how AppKit reports wallet type
}

export const WalletConnectButton: React.FC<WalletConnectProps> = ({
  className,
  variant = "default",
  onConnect,
}) => {
  const appKitState = useAppKitState();
  const { caipNetwork, chainId: networkChainId } = useAppKitNetwork();
  const { isConnected, address, connector } = useAppKitAccount();

  // Use chainId from either network or state for backward compatibility
  const chainId = networkChainId || appKitState.chainId;

  const [userId, setUserId] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle automatic user registration when wallet connects
  useEffect(() => {
    const registerUserWithWallet = async () => {
      if (isConnected && address) {
        try {
          const walletType = getWalletType();
          if (walletType === "solana" || walletType === "ethereum") {
            // Call API to register the user
            const response = await fetch("/api/user/auto-register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                address,
                walletType,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              setUserId(data.userId);
              console.log(`User registered/retrieved: ${data.userId}`);
            }
          }
        } catch (error) {
          console.error("Failed to auto-register user:", error);
        }
      }
    };

    if (isClient && isConnected && address) {
      registerUserWithWallet();
    }
  }, [isConnected, address, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine wallet type using the improved logic
  const getWalletType = (): "ethereum" | "solana" | "unknown" => {
    // Check if we're connected first
    if (!isConnected || !connector) return "unknown";

    // Check for Solana wallet
    if (
      chainId === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" ||
      connector.id.includes("solana") ||
      appKitState.selectedNetworkId?.toString().startsWith("solana:")
    ) {
      return "solana";
    }

    // Check chainId for EVM/BSC networks
    if (typeof chainId === "number" && (chainId === 56 || chainId === 97)) {
      return "ethereum";
    }

    // Check for EVM connector indicators
    if (
      connector.id.includes("metaMask") ||
      connector.id.includes("walletConnect") ||
      connector.name?.toLowerCase().includes("metamask") ||
      connector.name?.toLowerCase().includes("walletconnect") ||
      appKitState.selectedNetworkId?.toString().startsWith("eip155:")
    ) {
      return "ethereum";
    }

    return "unknown"; // Default or if specific checks fail
  };

  const currentWalletType = getWalletType();

  // Previous connection state for toast notifications
  const [prevConnected, setPrevConnected] = useState<boolean | null>(null);
  const [prevAddress, setPrevAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isClient) return; // Ensure client-side only

    if (prevConnected === null) {
      setPrevConnected(isConnected);
      if (isConnected && address) setPrevAddress(address);
      return;
    }

    if (isConnected && address && (!prevConnected || address !== prevAddress)) {
      const walletType = getWalletType();
      if (onConnect && (walletType === "ethereum" || walletType === "solana")) {
        onConnect(walletType);
      }
      toast.success(
        `${walletType === "solana" ? "Solana" : "BSC/EVM"} wallet connected`,
        {
          description: `Address: ${getDisplayAddress()}`,
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        }
      );
    } else if (!isConnected && prevConnected) {
      const walletType = getWalletType(); // Get type even on disconnect if possible
      toast.info(
        `${walletType === "solana" ? "Solana" : "BSC/EVM"} wallet disconnected`
      );
    }

    setPrevConnected(isConnected);
    if (isConnected && address) setPrevAddress(address as string);
    else setPrevAddress(null);
  }, [
    isConnected,
    address,
    onConnect,
    isClient,
    prevConnected,
    prevAddress,
    chainId,
    connector,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOptions]);

  const handleConnect = () => {
    modal.open(); // Open AppKit's modal
  };

  const handleDisconnect = async () => {
    try {
      if (modal.disconnect) {
        await modal.disconnect();
      } else {
        console.warn("Disconnect function not available on modal instance.");
        toast.error("Disconnect functionality not available.");
        return;
      }
      setShowOptions(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet", {
        description: "Please try again.",
      });
    }
  };

  const getDisplayAddress = () => {
    if (isConnected && address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return null;
  };

  const displayAddress = getDisplayAddress();

  // Get specific network name based on chainId
  const getNetworkName = () => {
    if (currentWalletType === "solana") {
      return "SOL";
    } else if (currentWalletType === "ethereum") {
      // Determine specific EVM network
      if (typeof chainId === "number") {
        if (chainId === 56) return "BSC";
        if (chainId === 97) return "BSC Testnet";
        if (chainId === 8453) return "Base";
        if (chainId === 1) return "ETH";
      }
      return "BSC";
    }
    return "";
  };

  const walletTypeDisplay = getNetworkName();

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
          onClick={() =>
            isClient && isConnected
              ? setShowOptions(!showOptions)
              : handleConnect()
          }
        >
          {!isClient ? ( // Initial render before client check
            <>
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </>
          ) : isConnected ? (
            <>
              <Wallet size={16} />
              <span>Wallet Connected</span>
            </>
          ) : (
            <>
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </>
          )}
          {isClient && isConnected && (
            <>
              <div className="flex items-center gap-1 ml-2">
                {walletTypeDisplay && (
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      currentWalletType === "solana"
                        ? "bg-purple-500/20"
                        : "bg-amber-500/20"
                    )}
                  >
                    {walletTypeDisplay}
                  </div>
                )}
              </div>
              <ChevronDown size={14} className="ml-1 opacity-70" />
            </>
          )}
        </Button>

        {isClient && showOptions && isConnected && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 right-0 bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-lg p-2 z-50 min-w-[220px]"
          >
            <div className="flex flex-col gap-1">
              <div className="p-2 mb-1 text-sm font-medium text-primary border-b border-border/50">
                Connected Wallet ({walletTypeDisplay})
              </div>

              {displayAddress && (
                <div className="p-2 text-xs border-b border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        currentWalletType === "solana"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      )}
                    ></div>
                    <div className="text-white/70 font-medium">
                      {currentWalletType === "solana" ? "Solana" : "BSC/EVM"}
                    </div>
                  </div>
                  <div className="font-mono bg-black/40 p-1.5 rounded text-xs overflow-hidden text-ellipsis">
                    {displayAddress}
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center justify-start gap-2 hover:bg-destructive/10 text-destructive mt-1"
                onClick={handleDisconnect}
              >
                <X size={14} />
                <span>Disconnect</span>
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* WalletConnectModal removed as AppKit's modal will be used via modal.open() */}
      {/* <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      /> */}
    </>
  );
};
