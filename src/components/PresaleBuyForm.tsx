"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  ArrowRight,
  Wallet,
  RefreshCcw,
  Loader2,
  DollarSign,
} from "lucide-react";
import usePresale from "@/components/hooks/usePresale";
import GlowButton from "@/components/GlowButton";
import { toast } from "sonner";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { useBscPresale } from "./hooks/useBscPresale";
import { useSolanaPresale } from "./hooks/useSolanaPresale";
import TransactionStatusModal from "./TransactionStatusModal";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { solana, base, bscTestnet, polygonAmoy } from "@reown/appkit/networks";

interface PresaleBuyFormProps {
  referralCode?: string;
  className?: string;
}

const PresaleBuyForm: React.FC<PresaleBuyFormProps> = ({
  referralCode,
  className = "",
}) => {
  // State
  const [customReferralCode, setCustomReferralCode] = useState<string>(
    referralCode || ""
  );
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { isConnected, address } = useAppKitAccount();

  const [network, setNetwork] = useState<"bsc" | "solana">("bsc");

  useEffect(() => {
    // Switch network based on CAIP network
    if (chainId === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp") {
      setNetwork("solana");
    } else {
      setNetwork("bsc");
    }
  }, [chainId]);

  // Get all presale functionality from the usePresale hook
  const {
    signReferralCode,
    cryptoPrices,
    isLoadingPrices,
    loadCryptoPrices,
    calculateTokensFromCrypto,
    lmxPriceUsd,
    presaleStatus,
    max,
    min,
    totalRaised,
    percentageSold,
    hardcap,
    soldTokens,
  } = usePresale();
  // Use the appropriate hook based on selected network
  const {
    buyTokens: buyBscTokens,
    isLoading: isBscBuying,
    // Add these properties if they exist in the BSC hook, otherwise will be undefined
    isModalOpen: isBscModalOpen = false,
    closeModal: closeBscModal = () => {},
    transactionStatus: bscTransactionStatus = {
      steps: [],
      currentStepId: null,
      isComplete: false,
      isError: false,
    },
    transactionSignature: bscTransactionSignature = null,
  } = useBscPresale(tokenAmount, customReferralCode);

  const {
    buyTokens: buySolTokens,
    isLoading: isSolBuying,
    isModalOpen: isSolModalOpen = false,
    closeModal: closeSolModal = () => {},
    transactionStatus: solTransactionStatus = {
      steps: [],
      currentStepId: null,
      isComplete: false,
      isError: false,
    },
    transactionSignature: solTransactionSignature = null,
  } = useSolanaPresale(tokenAmount, customReferralCode);

  // Use the appropriate values based on selected network
  const isLoading = network === "bsc" ? isBscBuying : isSolBuying;
  const isModalOpen = network === "bsc" ? isBscModalOpen : isSolModalOpen;
  const closeModal = network === "bsc" ? closeBscModal : closeSolModal;
  const transactionStatus =
    network === "bsc" ? bscTransactionStatus : solTransactionStatus;
  const transactionSignature =
    network === "bsc" ? bscTransactionSignature : solTransactionSignature;

  // Wallet connection status
  const hasWalletConnected = isConnected && address;

  // Set currency symbol based on selected network
  const currencySymbol = network === "bsc" ? "BNB" : "SOL";

  // Handle network switch
  const handleNetworkChange = (newNetwork: "bsc" | "solana") => {
    switchNetwork(newNetwork === "bsc" ? bscTestnet : solana);
    setNetwork(newNetwork);
  };

  // Update crypto amount when token amount changes or network changes
  const updateCryptoAmount = (amount: number) => {
    if (!cryptoPrices) return;

    if (network === "bsc") {
      const bnbCost = (amount * lmxPriceUsd) / cryptoPrices.bnb;
      setCryptoAmount(parseFloat(bnbCost.toFixed(8))); // BNB precision
    } else {
      const solCost = (amount * lmxPriceUsd) / cryptoPrices.sol;
      setCryptoAmount(parseFloat(solCost.toFixed(9))); // SOL has 9 decimals
    }
  };

  // Run calculation when network changes or when prices update
  useEffect(() => {
    if (tokenAmount > 0 && cryptoPrices) {
      updateCryptoAmount(tokenAmount);
    }
  }, [network, cryptoPrices, tokenAmount, lmxPriceUsd]);

  // Handle token amount change with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (isNaN(value) || value < 0) {
      setTokenAmount(0);
      setCryptoAmount(0);
      return;
    }

    setTokenAmount(value);
    updateCryptoAmount(value);
  };

  // Handle purchase
  const handleBuy = async () => {
    // Validate presale status
    if (!presaleStatus) {
      toast.error("Presale is not active");
      return;
    }

    // Validate wallet connection based on selected network
    if (!hasWalletConnected) {
      toast.error(`Please connect your ${network.toUpperCase()} wallet first`);
      return;
    }

    // Convert min/max to appropriate units
    const minPurchase = parseFloat(String(min) ?? "0") / 1000000000000000000;
    const maxPurchase = parseFloat(String(max) ?? "0") / 1000000000000000000;

    // Validate purchase amount
    if (tokenAmount < minPurchase) {
      toast.error(`Minimum purchase amount is ${minPurchase} LMX tokens`);
      return;
    }

    if (tokenAmount > maxPurchase) {
      toast.error(`Maximum purchase amount is ${maxPurchase} LMX tokens`);
      return;
    }

    try {
      // Execute purchase based on selected network
      if (network === "bsc") {
        await buyBscTokens();
      } else {
        await buySolTokens();
      }
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
      {/* Header */}{" "}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Buy LMX Tokens</h2>
        <div className="flex items-center gap-3">
          {/* Network selector */}
          <div className="flex bg-black/30 rounded-md p-1 border border-primary/20">
            <button
              onClick={() => handleNetworkChange("bsc")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                network === "bsc"
                  ? "bg-primary/30 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              BSC
            </button>
            <button
              onClick={() => handleNetworkChange("solana")}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                network === "solana"
                  ? "bg-primary/30 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Solana
            </button>
          </div>

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
      </div>
      {/* Loading state */}
      {isLoadingPrices && !cryptoPrices ? (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-primary/70 text-center">Loading price data...</p>
        </div>
      ) : (
        <>
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

          {/* Purchase Form */}
          {presaleStatus && (
            <>
              {/* Token Amount Input */}
              <div className="mb-6">
                <Label
                  htmlFor="amount"
                  className="text-sm text-white/70 block mb-2"
                >
                  Number of LMX Tokens
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="amount"
                    type="number"
                    value={tokenAmount}
                    onChange={handleAmountChange}
                    className="bg-black/30 border border-primary/20 text-white"
                    step="1"
                    placeholder="100"
                  />
                  <div className="bg-black/40 px-3 py-2 rounded-md text-white/80">
                    LMX
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mt-2 text-sm text-center text-white/70">
                  ≈ {cryptoAmount.toFixed(8)} {currencySymbol}
                  <span className="mx-2 text-white/40">|</span>$
                  {(tokenAmount * lmxPriceUsd).toFixed(2)} USD
                </div>
              </div>

              {/* Referral Code Input */}
              <div className="mb-6">
                <Label
                  htmlFor="referral"
                  className="text-sm text-white/70 block mb-2"
                >
                  Referral Code (Optional)
                </Label>
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
              </div>

              {/* Buy Button */}
              <div className="mb-4">
                {!hasWalletConnected ? (
                  <WalletConnectButton className="w-full py-3" />
                ) : (
                  <GlowButton
                    onClick={handleBuy}
                    disabled={isLoading || !presaleStatus || tokenAmount <= 0}
                    className="w-full py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        Buy {tokenAmount} LMX for {cryptoAmount.toFixed(6)}{" "}
                        {currencySymbol}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </GlowButton>
                )}

                {/* Simplified wallet connection status */}
                <div
                  className={`mt-2 text-sm text-center ${
                    hasWalletConnected ? "text-green-400" : "text-amber-400"
                  }`}
                >
                  {hasWalletConnected ? (
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      {network.toUpperCase()} Wallet Connected
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
                      {network.toUpperCase()} Wallet Not Connected
                    </div>
                  )}
                </div>
              </div>

              {/* Presale Progress */}
              <div className="mt-6">
                <div className="bg-black/20 p-3 rounded-md mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">LMX Price:</span>
                    <span className="text-white">${lmxPriceUsd}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Tokens Sold:</span>
                    <span className="text-white">
                      {String(soldTokens)} / {String(hardcap)} LMX
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/70">Total Raised:</span>
                    <span className="text-white">
                      {String(totalRaised)} {currencySymbol}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${percentageSold}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <div className="text-right text-xs text-primary">
                  {percentageSold.toFixed(2)}% sold
                </div>
              </div>

              {/* Link to purchase history */}
              <div className="mt-4 text-center">
                <Link
                  href="/presale/purchases"
                  className="text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-2"
                >
                  View your purchase history
                </Link>
              </div>
            </>
          )}
        </>
      )}
      {/* Transaction Status Modal for both BSC and Solana transactions */}
      <TransactionStatusModal
        isOpen={isModalOpen}
        onClose={closeModal}
        status={transactionStatus}
        title={`${network.toUpperCase()} Transaction Status`}
        transactionSignature={transactionSignature || undefined}
        network={network}
      />
    </div>
  );
};

export default PresaleBuyForm;
