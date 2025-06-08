"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Wallet,
  RefreshCcw,
  Loader2,
  RotateCcw,
  DollarSign,
} from "lucide-react";

import usePresale from "@/components/hooks/usePresale";
import { useBscPresale } from "@/components/hooks/useBscPresale";
import GlowButton from "@/components/GlowButton";
import { toast } from "sonner";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { LMX_PRICE_USD } from "@/lib/price-utils";
import { useAccount, useWalletClient } from "wagmi";

interface PresaleBuyFormProps {
  referralCode?: string;
  className?: string;
}

const PresaleBuyForm: React.FC<PresaleBuyFormProps> = ({
  referralCode,
  className = "",
}) => {
  const [customReferralCode, setCustomReferralCode] = useState<string>(
    referralCode || ""
  );
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const [inputMode, setInputMode] = useState<"token" | "crypto">("token");
  const [network, setNetwork] = useState<"bsc" | "solana">("bsc");
  const [isLoading, setIsLoading] = useState(false);

  // Use presale hook for functions and price data
  const {
    signReferralCode,
    cryptoPrices,
    estimatedCost,
    isLoadingPrices,
    loadCryptoPrices,
    calculateTokensFromCrypto,
    lmxPriceUsd,
  } = usePresale();

  // Use presale hook for status data
  const { presaleStatus } = usePresale();
  const [hasBscWalletConnected, setHasBscWalletConnected] = useState(false);
  const [hasSolanaWalletConnected, setHasSolanaWalletConnected] =
    useState(false);

  // Use wagmi hook for BSC purchases
  const {
    buyTokens: buyOnBsc,
    isLoading: isBscTxLoading,
    bnbPrice,
  } = useBscPresale(tokenAmount, customReferralCode);

  // Only using BSC
  const currencySymbol = "BNB";

  // Check wallet connection status
  const { isConnected, chain } = useAccount();

  useEffect(() => {
    if (isConnected) {
      // Check if connected to BSC
      if (chain?.id === 56 || chain?.id === 97) {
        setHasBscWalletConnected(true);
      } else {
        setHasBscWalletConnected(false);
      }

      // Check if connected to Solana
      // This is a placeholder, actual Solana connection check would depend on your wallet setup
      setHasSolanaWalletConnected(false); // Assume not connected for now
    }
  }, [isConnected, chain]);

  // Use actual Solana connection but only for referral signing

  // Handle token amount change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (isNaN(value) || value < 0) {
      if (inputMode === "token") {
        setTokenAmount(0);
        setCryptoAmount(0);
      } else {
        setCryptoAmount(0);
        setTokenAmount(0);
      }
      return;
    }

    if (inputMode === "token") {
      setTokenAmount(value);

      // Calculate crypto amount based on token amount
      if (cryptoPrices) {
        const bnbCost = (value * lmxPriceUsd) / cryptoPrices.bnb;
        setCryptoAmount(parseFloat(bnbCost.toFixed(8))); // BNB precision
      }
    } else {
      setCryptoAmount(value);

      // Calculate token amount based on crypto amount
      if (cryptoPrices) {
        const tokens = calculateTokensFromCrypto(value, "bnb");
        setTokenAmount(Math.floor(tokens)); // Round down to nearest whole token
      }
    }
  };

  // Toggle between input modes (token amount vs crypto amount)
  const toggleInputMode = () => {
    setInputMode(inputMode === "token" ? "crypto" : "token");
  };

  // Handle network switching
  const switchNetwork = (newNetwork: "bsc" | "solana") => {
    // Only allow BSC network for now
    if (newNetwork === "solana") {
      toast.info("Solana presale is currently disabled. Using BSC instead.");
      setNetwork("bsc");
      return;
    }
    setNetwork(newNetwork);
  };

  // Handle buy button click
  const handleBuy = async () => {
    if (!presaleStatus?.isActive) {
      toast.error("Presale is not active");
      return;
    }

    const minPurchase = parseFloat(presaleStatus.minPurchase);
    const maxPurchase = parseFloat(presaleStatus.maxPurchase);

    if (tokenAmount < minPurchase) {
      toast.error(`Minimum purchase amount is ${minPurchase} tokens`);
      return;
    }

    if (tokenAmount > maxPurchase) {
      toast.error(`Maximum purchase amount is ${maxPurchase} tokens`);
      return;
    }

    try {
      // Force BSC for all purchases
      if (network !== "bsc") {
        toast.info("Only BSC purchases are currently supported");
        setNetwork("bsc");
        return;
      }

      // Buy on BSC using wagmi hooks
      buyOnBsc?.();
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast.error("Failed to purchase tokens");
    }
  };

  // Refresh price data
  const refreshPrices = async () => {
    toast.info("Refreshing cryptocurrency prices...");
    await loadCryptoPrices();
    toast.success("Cryptocurrency prices updated");
  };

  return (
    <div
      className={`bg-black/30 backdrop-blur-md rounded-xl p-6 border border-primary/10 ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Buy Tokens</h2>

        <button
          onClick={refreshPrices}
          className="text-primary hover:text-primary/80 transition-colors"
          title="Refresh cryptocurrency prices"
          disabled={isLoadingPrices}
        >
          {isLoadingPrices ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCcw className="h-5 w-5" />
          )}
        </button>
      </div>

      {isLoadingPrices && !cryptoPrices ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-primary/70 text-center">Loading price data...</p>
        </div>
      ) : (
        <>
          {/* Network Selection */}
          <div className="mb-6">
            <Label
              htmlFor="network"
              className="text-sm text-white/70 block mb-2"
            >
              Select Network
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => switchNetwork("bsc")}
                className={`p-3 rounded-md flex items-center justify-center gap-2 transition-all ${
                  network === "bsc"
                    ? "bg-gradient-to-r from-amber-600/30 to-amber-500/30 border border-amber-500/50 text-amber-200"
                    : "bg-black/20 border border-white/5 text-white/70 hover:bg-black/30"
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                <span>BSC {hasBscWalletConnected ? "✓" : ""}</span>
              </button>

              <button
                type="button"
                disabled={true}
                className={`p-3 rounded-md flex items-center justify-center gap-2 transition-all opacity-50 cursor-not-allowed bg-black/20 border border-white/5 text-white/50`}
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-50" />
                <span>Solana (Disabled)</span>
              </button>
            </div>
          </div>

          {/* Current Price Information */}
          <div className="mb-6 p-3 bg-black/40 rounded-lg border border-primary/10">
            <div className="text-sm font-medium text-white/80 mb-2">
              Current LMX Price:
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-400">
                  ${lmxPriceUsd.toFixed(4)}
                </span>
              </div>
              <span className="text-xs text-white/60">Fixed USD Price</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">1 LMX =</div>
                <div className="text-sm">
                  <span className="text-amber-400">
                    {cryptoPrices
                      ? (lmxPriceUsd / cryptoPrices.bnb).toFixed(8)
                      : "..."}{" "}
                    BNB
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">1 BNB =</div>
                <div className="text-sm">
                  <span className="text-amber-400">
                    {cryptoPrices
                      ? (cryptoPrices.bnb / lmxPriceUsd).toFixed(2)
                      : "..."}{" "}
                    LMX
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection Status */}
          <div className="mb-6 p-4 bg-black/40 rounded-lg border border-primary/10">
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <p className="text-white/70 text-sm mb-1">BSC Wallet:</p>
                <p
                  className={`text-sm ${
                    hasBscWalletConnected ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {hasBscWalletConnected ? "Connected" : "Not Connected"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm mb-1">Solana Wallet:</p>
                <p
                  className={`text-sm ${
                    hasSolanaWalletConnected
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {hasSolanaWalletConnected
                    ? "Connected (for referrals)"
                    : "Optional for referrals"}
                </p>
              </div>
            </div>
            <WalletConnectButton variant="fancy" className="mx-auto" />
          </div>

          {/* Token Purchase Form - Always show form info even when wallet is not connected */}
          {presaleStatus && (
            <>
              {/* Input with toggle between token and crypto amount */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="amount" className="text-sm text-white/70">
                    {inputMode === "token"
                      ? "Token Amount"
                      : `${currencySymbol} Amount`}
                  </Label>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleInputMode}
                    className="h-7 text-xs px-2 text-primary/80 hover:text-primary hover:bg-primary/10"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Switch to {inputMode === "token" ? currencySymbol : "LMX"}
                  </Button>
                </div>

                <div className="flex gap-2 items-center">
                  <Input
                    id="amount"
                    type="number"
                    value={inputMode === "token" ? tokenAmount : cryptoAmount}
                    onChange={handleAmountChange}
                    className="bg-black/30 border border-primary/20 text-white"
                    min={inputMode === "token" ? presaleStatus.minPurchase : 0}
                    max={
                      inputMode === "token"
                        ? presaleStatus.maxPurchase
                        : undefined
                    }
                    step={inputMode === "token" ? "1" : "0.000001"}
                    placeholder={inputMode === "token" ? "100" : "0.01"}
                  />
                  <div className="bg-black/40 px-3 py-2 rounded-md text-white/80">
                    {inputMode === "token" ? "LMX" : currencySymbol}
                  </div>
                </div>

                {inputMode === "token" && (
                  <div className="flex justify-between text-xs text-white/60 mt-1 px-1">
                    <span>Min: {presaleStatus.minPurchase}</span>
                    <span>Max: {presaleStatus.maxPurchase}</span>
                  </div>
                )}

                {/* Show the conversion value */}
                <div className="mt-2 text-sm text-center text-white/70">
                  {inputMode === "token" ? (
                    <>
                      ≈ {cryptoAmount.toFixed(8)} {currencySymbol}
                      <span className="mx-2 text-white/40">|</span>$
                      {(tokenAmount * lmxPriceUsd).toFixed(2)} USD
                    </>
                  ) : (
                    <>
                      ≈ {tokenAmount.toFixed(0)} LMX
                      <span className="mx-2 text-white/40">|</span>$
                      {(cryptoAmount * (cryptoPrices?.bnb || 0)).toFixed(2)} USD
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <Label
                  htmlFor="referral"
                  className="text-sm text-white/70 block mb-2"
                >
                  Referral Code (Optional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="referral"
                    type="text"
                    value={customReferralCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCustomReferralCode(e.target.value)
                    }
                    className="bg-black/30 border border-primary/20 text-white"
                    placeholder="Enter referral code"
                  />
                  {hasSolanaWalletConnected && (
                    <Button
                      variant="outline"
                      className="min-w-[120px] bg-purple-800/50 border-purple-500/30 hover:bg-purple-700/60"
                      onClick={async () => {
                        if (!customReferralCode) {
                          toast.error("Please enter a referral code to sign");
                          return;
                        }
                        const signed = await signReferralCode(
                          customReferralCode
                        );
                        if (signed) {
                          toast.success(
                            "Referral code signed with Solana wallet"
                          );
                        }
                      }}
                    >
                      Sign w/ Solana
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <GlowButton
                  onClick={handleBuy}
                  disabled={
                    isBscTxLoading ||
                    !presaleStatus.isActive ||
                    !hasBscWalletConnected ||
                    tokenAmount <= 0
                  }
                  className="w-full py-3"
                >
                  {isBscTxLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : !hasBscWalletConnected ? (
                    <>
                      Connect BSC Wallet
                      <Wallet className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Buy {tokenAmount} LMX for {cryptoAmount.toFixed(6)}{" "}
                      {currencySymbol}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </GlowButton>
              </div>

              {/* Presale Progress and Info */}
              <div className="mt-6">
                <div className="bg-black/20 p-3 rounded-md mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">LMX Price:</span>
                    <span className="text-white">${lmxPriceUsd}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Tokens Sold:</span>
                    <span className="text-white">
                      {presaleStatus.soldTokens} / {presaleStatus.hardCap} LMX
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/70">Total Raised:</span>
                    <span className="text-white">
                      {presaleStatus.totalRaised} {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${presaleStatus.percentageSold}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-right text-xs text-primary">
                  {presaleStatus.percentageSold.toFixed(2)}% sold
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PresaleBuyForm;
