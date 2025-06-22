"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { SolanaWalletPrompt } from "./SolanaWalletPrompt";
import { BSCWalletPrompt } from "./BSCWalletPrompt";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { solana, base, bsc } from "@reown/appkit/networks";
import { formatEther } from "viem";
import { getCookie } from "@/lib/cookies";
import { getStoredReferralCode } from "@/lib/referral";
import { useSession } from "next-auth/react";
import { modal } from "@/components/providers/wallet-provider";
import useReferralHandling from "./hooks/useReferralHandling";

// Extended type for our session with referredBy field
interface CustomSessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  walletAddress?: string | null;
  solanaAddress?: string | null;
  evmAddress?: string | null;
  referralCode?: string | null;
  referredBy?: string | null;
}

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
  const [usdAmount, setUsdAmount] = useState<number>(50); // Default USD amount
  const [tokenAmount, setTokenAmount] = useState<number>(100); // Derived from USD amount
  const [cryptoAmount, setCryptoAmount] = useState<number>(0);
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { isConnected, address } = useAppKitAccount();
  const { data: session } = useSession();
  const user = session?.user as CustomSessionUser | undefined;
  const referralInfo = useReferralHandling();

  // Debug: Log session data to help understand its structure
  useEffect(() => {
    if (session) {
      //console.log("Session data:", session);
      //console.log("User data with referredBy:", user);
    }
  }, [session, user]);

  // Get referral code from multiple sources
  useEffect(() => {
    // Skip if referral code is already set via props
    if (referralCode) {
      //console.log("Using referral code from props:", referralCode);
      return;
    }

    // Check for referral code in session data first
    if (user?.referredBy) {
      //console.log("Using referral code from session:", user.referredBy);
      setCustomReferralCode(user.referredBy);
      return;
    }

    // Try to get referral code from cookies
    const cookieRefCode = getCookie("referralCode");
    if (cookieRefCode) {
      //console.log("Using referral code from cookie:", cookieRefCode);
      setCustomReferralCode(cookieRefCode);

      return;
    }

    // Try to get referral code from localStorage
    const storedRefCode = getStoredReferralCode();
    if (storedRefCode) {
      //console.log("Using referral code from localStorage:", storedRefCode);
      setCustomReferralCode(storedRefCode);
      return;
    }

    // Try to get referral code from URL (for new visitors)
    const urlParams = new URLSearchParams(window.location.search);
    const urlRefCode = urlParams.get("ref") || urlParams.get("referral");
    if (urlRefCode) {
      //console.log("Using referral code from URL:", urlRefCode);
      setCustomReferralCode(urlRefCode);
    } else {
      //console.log("No referral code found in any source");
    }
  }, [referralCode, user]);

  const [network, setNetwork] = useState<"bsc" | "solana">("bsc");
  const [showSolanaVerificationModal, setShowSolanaVerificationModal] =
    useState(false);
  const [showBSCVerificationModal, setShowBSCVerificationModal] =
    useState(false);

  useEffect(() => {
    // Switch network based on CAIP network
    if (chainId === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp") {
      setNetwork("solana");
    } else {
      setNetwork("bsc");
    }
  }, [chainId]);

  // Handle session updates after wallet verification
  useEffect(() => {
    // Check if wallet has been verified after a modal was shown
    if (
      network === "solana" &&
      user?.solanaAddress &&
      showSolanaVerificationModal
    ) {
      setShowSolanaVerificationModal(false);
      toast.success("Solana wallet successfully verified!");
    }

    if (network === "bsc" && user?.evmAddress && showBSCVerificationModal) {
      setShowBSCVerificationModal(false);
      toast.success("BSC wallet successfully verified!");
    }
  }, [
    user?.solanaAddress,
    user?.evmAddress,
    network,
    showSolanaVerificationModal,
    showBSCVerificationModal,
  ]);

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
    switchNetwork(newNetwork === "bsc" ? bsc : solana);
    setNetwork(newNetwork);
  };

  // Handle wallet verification based on current network
  const handleVerifyWallet = () => {
    // First connect wallet if needed, otherwise show relevant verification prompt
    if (!hasWalletConnected) {
      modal.open();
    } else {
      // Using toast to inform user what they need to do
      if (network === "bsc" && !user?.evmAddress) {
        toast.info("Please verify your BSC wallet to continue with purchase");
        // Clear any skip flags
        localStorage.removeItem("skipBSCWalletPrompt");
        // Show BSC verification modal
        setShowBSCVerificationModal(true);
      } else if (network === "solana" && !user?.solanaAddress) {
        toast.info(
          "Please verify your Solana wallet to continue with purchase"
        );
        // Clear any skip flags
        localStorage.removeItem("skipWalletPrompt");
        // Show Solana verification modal
        setShowSolanaVerificationModal(true);
      }
    }
  };

  // Update token and crypto amounts when USD amount changes
  const updateAmounts = (usdValue: number) => {
    if (!cryptoPrices || !lmxPriceUsd) return;

    // Calculate LMX tokens from USD
    const tokens = usdValue / lmxPriceUsd;
    setTokenAmount(tokens);

    // Calculate crypto amount from USD
    if (network === "bsc") {
      const bnbCost = usdValue / cryptoPrices.bnb;
      setCryptoAmount(parseFloat(bnbCost.toFixed(8))); // BNB precision
    } else {
      const solCost = usdValue / cryptoPrices.sol;
      setCryptoAmount(parseFloat(solCost.toFixed(9))); // SOL has 9 decimals
    }
  };

  // Run calculation when network changes or when prices update
  useEffect(() => {
    if (usdAmount > 0 && cryptoPrices && lmxPriceUsd) {
      updateAmounts(usdAmount);
    }
  }, [network, cryptoPrices, usdAmount, lmxPriceUsd]);

  // Make sure token amount is updated if LMX price changes
  useEffect(() => {
    if (usdAmount > 0 && lmxPriceUsd > 0) {
      // Update token amount when LMX price changes
      const newTokenAmount = usdAmount / lmxPriceUsd;
      setTokenAmount(newTokenAmount);
    }
  }, [lmxPriceUsd, usdAmount]);

  // Handle USD amount change with validation
  const handleUsdAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    if (value < 0) {
      setUsdAmount(0);
      setTokenAmount(0);
      setCryptoAmount(0);
      return;
    }

    setUsdAmount(value);
    updateAmounts(value);
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

    // Calculate min and max in USD
    const minPurchaseUsd = minPurchase * lmxPriceUsd;
    const maxPurchaseUsd = maxPurchase * lmxPriceUsd;

    // Validate purchase amount in USD
    if (usdAmount < minPurchaseUsd) {
      toast.error(
        `Minimum purchase amount is $${minPurchaseUsd.toFixed(
          2
        )} (${minPurchase} LMX tokens)`
      );
      return;
    }

    if (usdAmount > maxPurchaseUsd) {
      toast.error(
        `Maximum purchase amount is $${maxPurchaseUsd.toFixed(
          2
        )} (${maxPurchase} LMX tokens)`
      );
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
              Token Price Information:
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-400 font-bold">
                  ${lmxPriceUsd.toFixed(4)} per LMX
                </span>
              </div>
              <span className="text-xs text-white/60">Fixed USD Price</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">
                  For $1 USD you get
                </div>
                <div className="text-sm">
                  <span className="text-amber-400 font-medium">
                    {lmxPriceUsd > 0 ? (1 / lmxPriceUsd).toFixed(4) : "..."} LMX
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/60 mb-1">
                  1 {network === "bsc" ? "BNB" : "SOL"} =
                </div>
                <div className="text-sm">
                  <span className="text-amber-400">
                    {cryptoPrices
                      ? (
                          cryptoPrices[network === "bsc" ? "bnb" : "sol"] /
                          lmxPriceUsd
                        ).toFixed(2)
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
              {/* USD Amount Input */}
              <div className="mb-6">
                <Label
                  htmlFor="usdAmount"
                  className="text-sm text-white/70 block mb-2"
                >
                  Amount in USD
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="usdAmount"
                    type="number"
                    value={usdAmount}
                    onChange={handleUsdAmountChange}
                    className="bg-black/30 border border-primary/20 text-white"
                    step="1"
                    placeholder="50"
                  />
                  <div className="bg-black/40 px-3 py-2 rounded-md text-white/80">
                    USD
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mt-2 text-sm text-center text-white/70">
                  ≈ {tokenAmount.toFixed(2)} LMX
                  <span className="mx-2 text-white/40">|</span>
                  {cryptoAmount.toFixed(8)} {currencySymbol}
                </div>
              </div>

              {/* Referral Code Display (read-only) */}
              <div className="mb-6">
                {/* <Label
                  htmlFor="referral"
                  className="text-sm text-white/70 block mb-2"
                >
                  Referral Code
                </Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="referral"
                    type="text"
                    value={customReferralCode}
                    readOnly
                    className="bg-black/30 border border-primary/20 text-white cursor-default"
                  />
                  {customReferralCode ? (
                    <div className="text-green-500 text-xs">
                      {user?.referredBy === customReferralCode
                        ? "From Session"
                        : "Applied"}
                    </div>
                  ) : (
                    <div className="text-yellow-500 text-xs">None</div>
                  )}
                </div> */}

                {/* Debug info (remove in production) */}
                {process.env.NODE_ENV !== "production" && (
                  <div className="mt-1 text-xs text-primary/50">
                    {user?.referredBy
                      ? `Session referral: ${user.referredBy}`
                      : "No session referral"}
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <div className="mb-4">
                {!hasWalletConnected ? (
                  <WalletConnectButton className="w-full py-3" />
                ) : network === "solana" && !user?.solanaAddress ? (
                  // If Solana network selected but no verified Solana address in session
                  <GlowButton
                    onClick={handleVerifyWallet}
                    className="w-full py-3 bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                  >
                    <>
                      Verify Solana Wallet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  </GlowButton>
                ) : network === "bsc" && !user?.evmAddress ? (
                  // If BSC network selected but no verified EVM address in session
                  <GlowButton
                    onClick={handleVerifyWallet}
                    className="w-full py-3 bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                  >
                    <>
                      Verify BSC Wallet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  </GlowButton>
                ) : (
                  <GlowButton
                    onClick={handleBuy}
                    disabled={isLoading || !presaleStatus || usdAmount <= 0}
                    className="w-full py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        Buy ${usdAmount.toFixed(2)} worth of LMX (
                        {tokenAmount.toFixed(2)} LMX)
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </GlowButton>
                )}

                {/* Wallet status indicators */}
                <div
                  className={`mt-2 text-sm text-center ${
                    hasWalletConnected ? "text-green-400" : "text-amber-400"
                  }`}
                >
                  {hasWalletConnected ? (
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                      {network.toUpperCase()} Wallet Connected
                      {(network === "solana" && !user?.solanaAddress) ||
                      (network === "bsc" && !user?.evmAddress) ? (
                        <span className="text-amber-400 ml-1">
                          (Needs Verification)
                        </span>
                      ) : null}
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
                      {formatEther(
                        BigInt(
                          typeof soldTokens === "string" ||
                            typeof soldTokens === "number"
                            ? soldTokens
                            : "0"
                        )
                      )}{" "}
                      /{" "}
                      {formatEther(
                        BigInt(
                          typeof hardcap === "string" ||
                            typeof hardcap === "number"
                            ? hardcap
                            : "0"
                        )
                      )}{" "}
                      LMX
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/70">Total Raised:</span>
                    <span className="text-white">
                      {typeof totalRaised === "string" ||
                      typeof totalRaised === "number"
                        ? parseFloat(String(totalRaised)).toFixed(4)
                        : "0"}{" "}
                      {currencySymbol}
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
      {/* Solana Wallet Verification Modal */}
      <Dialog
        open={showSolanaVerificationModal}
        onOpenChange={setShowSolanaVerificationModal}
      >
        <DialogContent className="bg-black border border-white/10 text-white p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-white/10">
            <DialogTitle className="text-lg font-medium">
              Verify Your Solana Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="p-0">
            <SolanaWalletPrompt
              isModal={true}
              onVerificationComplete={() => {
                setShowSolanaVerificationModal(false);
                // Small delay to allow session to update before refreshing
                setTimeout(() => window.location.reload(), 500);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* BSC Wallet Verification Modal */}
      <Dialog
        open={showBSCVerificationModal}
        onOpenChange={setShowBSCVerificationModal}
      >
        <DialogContent className="bg-black border border-white/10 text-white p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-white/10">
            <DialogTitle className="text-lg font-medium">
              Verify Your BSC Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="p-0">
            <BSCWalletPrompt
              isModal={true}
              onVerificationComplete={() => {
                setShowBSCVerificationModal(false);
                // Small delay to allow session to update before refreshing
                setTimeout(() => window.location.reload(), 500);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresaleBuyForm;
