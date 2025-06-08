"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEthereumWallet } from "@/components/providers/wallet-provider";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { connected: solanaConnected } = useWallet();
  const { isConnected: bscConnected, connect: connectBsc } =
    useEthereumWallet();
  const [connectingSolana, setConnectingSolana] = useState(false);

  const handleSolanaConnect = () => {
    setConnectingSolana(true);
  };

  const handleBscConnect = async () => {
    await connectBsc();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-md border border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-primary">
            Connect Your Wallets
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-4 rounded-lg bg-black/60 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-500">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-md font-medium">Solana Wallet</h3>
                  <p className="text-xs text-muted-foreground">
                    Connect your Phantom or Solflare wallet
                  </p>
                </div>
              </div>

              {solanaConnected ? (
                <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                  Connected
                </span>
              ) : connectingSolana ? (
                <WalletMultiButton className="!bg-transparent !text-primary !hover:bg-primary/10 !border !border-primary/20 !rounded-lg !h-9" />
              ) : (
                <Button
                  variant="outline"
                  onClick={handleSolanaConnect}
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  Connect
                </Button>
              )}
            </div>

            <div className="flex justify-between items-center p-4 rounded-lg bg-black/60 border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-md font-medium">BSC Wallet</h3>
                  <p className="text-xs text-muted-foreground">
                    Connect your MetaMask wallet
                  </p>
                </div>
              </div>

              {bscConnected ? (
                <span className="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                  Connected
                </span>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleBscConnect}
                  className="border-primary/20 text-primary hover:bg-primary/10"
                >
                  Connect
                </Button>
              )}
            </div>
          </div>

          <div className="text-xs text-center text-muted-foreground mt-2">
            Connect either or both wallets to participate in the presale
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
