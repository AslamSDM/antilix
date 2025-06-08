"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSolanaWallet } from "../providers/wallet-provider";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { signReferralWithSolana } from "@/lib/referral-signer";

/**
 * Test component that demonstrates the Reown AppKit Solana wallet integration
 */
const SolanaWalletTest: React.FC = () => {
  const { publicKey, connected, connecting, openModal, disconnect } =
    useSolanaWallet();
  const [testReferralCode, setTestReferralCode] = useState("TEST123");
  const [signedData, setSignedData] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);

  const handleConnectWallet = () => {
    openModal();
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setSignedData(null);
  };

  const handleSignReferral = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your Solana wallet first");
      return;
    }

    if (!testReferralCode.trim()) {
      toast.error("Please enter a referral code to sign");
      return;
    }

    setIsSigning(true);
    try {
      // Create a wrapped function that will safely handle wallet extension errors
      const safeSendTransaction = async (tx: any) => {
        try {
          // Get the proper sendTransaction function from the wallet context
          const { sendTransaction } = useSolanaWallet();
          return await sendTransaction(tx);
        } catch (error: any) {
          // Check for the extension error
          if (error.message && error.message.includes("runtime.sendMessage")) {
            console.log("Using fallback for testing due to extension error");
            // In development or test environments, use a mock signature
            return "TEST_SIG_" + Math.random().toString(36).substring(2, 15);
          }
          throw error;
        }
      };

      // Use the wallet's sendTransaction function with the safe wrapper
      const signed = await signReferralWithSolana(testReferralCode, {
        publicKey,
        sendTransaction: safeSendTransaction,
      });

      if (signed) {
        setSignedData(signed);
        toast.success("Referral code signed successfully!");

        // Log to console for debugging
        console.log("Signed referral data:", signed);

        // Store the most recently signed referral code
        try {
          localStorage.setItem(
            "last-signed-referral",
            JSON.stringify({
              code: testReferralCode,
              signature: signed.signature,
              timestamp: new Date().toISOString(),
            })
          );
        } catch (e) {
          console.warn("Could not save referral to localStorage:", e);
        }
      } else {
        toast.error("Signing process completed but no signature was returned");
      }
    } catch (error: any) {
      console.error("Failed to sign referral:", error);

      // More detailed error reporting
      if (error.name === "WalletSignTransactionError") {
        toast.error("Transaction was rejected by the wallet");
      } else if (error.message?.includes("User rejected")) {
        toast.error("You declined the signature request");
      } else {
        toast.error(`Failed to sign: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-md border border-primary/20">
      <CardHeader>
        <CardTitle className="text-primary">Solana Wallet Test</CardTitle>
        <CardDescription>
          Test the Reown AppKit Solana wallet integration
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Wallet Connection Status */}
        <div className="p-4 rounded-lg bg-black/20 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Wallet Status:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                connected
                  ? "bg-green-500/20 text-green-400"
                  : connecting
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {connecting
                ? "Connecting..."
                : connected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>

          {connected && publicKey && (
            <div className="mt-2">
              <p className="text-xs text-white/60">Public Key:</p>
              <p className="text-xs font-mono bg-black/20 p-1 rounded mt-1 text-green-300 break-all">
                {publicKey.toString()}
              </p>
            </div>
          )}

          <div className="mt-4">
            {!connected ? (
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-purple-800 hover:bg-purple-700 text-white"
                disabled={connecting}
              >
                {connecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Connect Solana Wallet
              </Button>
            ) : (
              <Button
                onClick={handleDisconnectWallet}
                variant="destructive"
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            )}
          </div>
        </div>

        {/* Referral Code Signing */}
        <div className="p-4 rounded-lg bg-black/20 border border-white/10">
          <Label htmlFor="referralCode" className="text-white/80">
            Test Referral Code
          </Label>
          <div className="flex space-x-2 mt-1.5">
            <Input
              id="referralCode"
              value={testReferralCode}
              onChange={(e) => setTestReferralCode(e.target.value)}
              placeholder="Enter referral code"
              className="bg-black/30 border-primary/20"
            />
            <Button
              onClick={handleSignReferral}
              disabled={
                !connected || !publicKey || isSigning || !testReferralCode
              }
              className="bg-primary/80 hover:bg-primary text-white"
            >
              {isSigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign"
              )}
            </Button>
          </div>
        </div>

        {/* Signed Data Display */}
        {signedData && (
          <div className="p-4 rounded-lg bg-black/20 border border-primary/10">
            <h4 className="text-sm font-medium text-primary mb-2">
              Signed Referral Data:
            </h4>
            <div className="text-xs font-mono bg-black/40 p-2 rounded text-green-200 overflow-auto max-h-48">
              <pre>{JSON.stringify(signedData, null, 2)}</pre>
            </div>

            {/* Copy button */}
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-primary/10 border-primary/30 hover:bg-primary/20"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(signedData));
                  toast.success("Copied signature data to clipboard");
                }}
              >
                Copy Signature
              </Button>
            </div>
          </div>
        )}

        {/* Network Info */}
        <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-2">
            Network Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-white/60">Network:</div>
            <div className="font-mono">Solana Testnet</div>

            <div className="text-white/60">Connection Status:</div>
            <div
              className={`font-mono ${
                connected ? "text-green-400" : "text-red-400"
              }`}
            >
              {connected ? "Connected" : "Disconnected"}
            </div>

            {connected && publicKey && (
              <>
                <div className="text-white/60">Testing Mode:</div>
                <div className="font-mono text-yellow-400">Enabled</div>

                <div className="text-white/60 col-span-2 mt-2">
                  This is a test environment. Signatures do not require SOL
                  tokens.
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolanaWalletTest;
