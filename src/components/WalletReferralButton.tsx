"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import useReferralSystem from "./hooks/useReferralSystem";
import { createSignMessage } from "@/lib/wallet-auth";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { LoaderCircle, Copy, Share2 } from "lucide-react";

interface WalletReferralButtonProps {
  className?: string;
}

export const WalletReferralButton: React.FC<WalletReferralButtonProps> = ({
  className,
}) => {
  // const { publicKey, signMessage } = useWallet();
  const { publicKey, signMessage } = {
    publicKey: "",
    signMessage: (msg: Uint8Array) => Promise.resolve(new Uint8Array()), // Mocked for example
  };
  // Mocked for example

  const { ethAddress, ethConnected } = {
    ethAddress: "",
    ethConnected: false,
  };
  const { userReferralCode, generateReferralWithWallet } = useReferralSystem();

  const [isVerifying, setIsVerifying] = useState(false);
  const [showReferralOptions, setShowReferralOptions] = useState(false);

  // Check if wallet is connected in any form
  const solanaConnected = !!publicKey;
  const walletConnected = solanaConnected || ethConnected;

  // Generate referral code with Solana wallet
  const verifyWithSolana = async () => {
    if (!publicKey || !signMessage) {
      toast.error("Solana wallet not fully connected");
      return;
    }

    setIsVerifying(true);
    try {
      const message = createSignMessage(publicKey.toString());
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      // Convert the signature to a base58 string
      const bs58 = (await import("bs58")).default;
      const signatureBase58 = bs58.encode(signature);

      // Call our API to verify the signature and generate a referral code
      const referralCode = await generateReferralWithWallet(
        publicKey.toString(),
        signatureBase58,
        message,
        "solana"
      );

      if (referralCode) {
        toast.success("Referral code generated successfully!");
        setShowReferralOptions(true);
      } else {
        toast.error("Failed to verify wallet ownership");
      }
    } catch (error) {
      console.error("Error signing message:", error);
      toast.error("Failed to sign message with wallet");
    } finally {
      setIsVerifying(false);
    }
  };

  // Mock Ethereum verification for now
  const verifyWithEthereum = async () => {
    if (!ethAddress) {
      toast.error("Ethereum wallet not connected");
      return;
    }

    setIsVerifying(true);
    try {
      // In a real implementation, we would use personal_sign or similar
      // For now, we'll just mock the verification
      const message = createSignMessage(ethAddress);
      const mockSignature = "mock-ethereum-signature";

      // Call our API to verify
      const referralCode = await generateReferralWithWallet(
        ethAddress,
        mockSignature,
        message,
        "ethereum"
      );

      if (referralCode) {
        toast.success("Referral code generated successfully!");
        setShowReferralOptions(true);
      } else {
        toast.error("Failed to verify wallet ownership");
      }
    } catch (error) {
      console.error("Error with Ethereum verification:", error);
      toast.error("Failed to verify with Ethereum wallet");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle copying referral link to clipboard
  const copyReferralLink = () => {
    if (!userReferralCode) return;

    const referralLink = `${window.location.origin}?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  // Handle sharing referral link
  const shareReferralLink = () => {
    if (!userReferralCode) return;

    const referralLink = `${window.location.origin}?ref=${userReferralCode}`;
    const shareText = `Join me on Litmex using my referral link: ${referralLink}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Litmex Referral",
          text: shareText,
          url: referralLink,
        })
        .then(() => toast.success("Referral link shared!"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      copyReferralLink();
    }
  };

  // If user already has a referral code, show options to copy/share
  if (userReferralCode) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium">Your referral code:</span>
          <code className="bg-background px-2 py-1 rounded">
            {userReferralCode}
          </code>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyReferralLink}
            className="flex-1"
          >
            <Copy size={16} className="mr-2" />
            Copy Link
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={shareReferralLink}
            className="flex-1"
          >
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </div>
    );
  }

  // If verification is in progress
  if (isVerifying) {
    return (
      <div className={cn("flex justify-center items-center py-3", className)}>
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        <p>Verifying wallet ownership...</p>
      </div>
    );
  }

  // If wallet is connected but no referral code yet
  if (walletConnected) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm text-center">
          Verify your wallet ownership to generate a referral code
        </p>
        <div className="flex gap-2">
          {solanaConnected && (
            <Button
              onClick={verifyWithSolana}
              variant="default"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Verify with Solana
            </Button>
          )}

          {ethConnected && (
            <Button
              onClick={verifyWithEthereum}
              variant="default"
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            >
              Verify with Ethereum
            </Button>
          )}
        </div>
      </div>
    );
  }

  // No wallet connected yet
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-center">
        Connect your wallet to generate a referral code
      </p>
      {/* <WalletMultiButton className="w-full" /> */}
    </div>
  );
};
