"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle } from "lucide-react";
import { useAppKitState } from "@reown/appkit/react";
import { modal } from "@/components/providers/wallet-provider";
import { AppKitStateShape } from "@/components/hooks/usePresale";

interface WalletConnectModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onCloseAction,
}) => {
  const appKitState = useAppKitState() as AppKitStateShape;
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { connected, connector, chainId, loading: appKitLoading } = appKitState;

  const isBscConnected = connected && (chainId === 56 || chainId === 97);
  const isSolanaConnected =
    connected && connector?.id?.toLowerCase().includes("solana");

  const handleConnect = async (walletType?: "bsc" | "solana") => {
    setConnectionError(null);
    try {
      if (walletType === "bsc") {
        await modal.open({ view: "Networks" });
      } else if (walletType === "solana") {
        await modal.open({
          view: "Networks" /*, specific solana options if available */,
        });
      } else {
        await modal.open();
      }
    } catch (error) {
      console.error(
        `Failed to open wallet modal (${walletType || "any"}):`,
        error
      );
      setConnectionError(`Failed to open wallet modal. Please try again.`);
    }
  };

  useEffect(() => {
    if (!isOpen || connected) {
      setConnectionError(null);
    }
  }, [isOpen, connected]);

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-md border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-primary">
            Connect Your Wallets
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Solana Wallet Section */}
          <div className="flex justify-between items-center p-4 rounded-lg bg-black/60 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-md font-medium">
                  Solana Wallet (Optional)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Only needed for referral signing
                </p>
              </div>
            </div>

            {isSolanaConnected ? (
              <Button
                variant="outline"
                onClick={() => modal.disconnect()}
                className="border-red-500/30 text-red-300 bg-red-900/30 hover:bg-red-900/50"
              >
                Disconnect Solana
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleConnect("solana")}
                disabled={appKitLoading}
                className="border-primary/20 text-primary hover:bg-primary/10"
              >
                {appKitLoading && !isSolanaConnected ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> Connecting...
                  </span>
                ) : (
                  "Connect Solana"
                )}
              </Button>
            )}
          </div>

          {/* BSC Wallet Section */}
          <div className="flex justify-between items-center p-4 rounded-lg bg-black/60 border border-primary/10 bg-amber-900/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-md font-medium">BSC Wallet (Required)</h3>
                <p className="text-xs text-muted-foreground">
                  Connect your MetaMask wallet for presale
                </p>
              </div>
            </div>

            {isBscConnected ? (
              <Button
                variant="outline"
                onClick={() => modal.disconnect()}
                className="border-red-500/30 text-red-300 bg-red-900/30 hover:bg-red-900/50"
              >
                Disconnect BSC
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleConnect("bsc")}
                disabled={appKitLoading}
                className="border-amber-500/30 text-amber-300 bg-amber-900/30 hover:bg-amber-900/50"
              >
                {appKitLoading && !isBscConnected ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> Connecting...
                  </span>
                ) : (
                  "Connect BSC"
                )}
              </Button>
            )}
          </div>

          {connectionError && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">{connectionError}</p>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground mt-4">
            BSC wallet is required for purchases. Solana wallet is optional for
            referral verification.
          </div>
          <Button
            onClick={() => modal.open()}
            variant="ghost"
            className="w-full mt-2 text-sm text-muted-foreground hover:text-primary"
          >
            Show All Wallet Options
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
