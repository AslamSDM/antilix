import { useState } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "sonner";
import { solanaPresale } from "@/lib/presale-contract";
import {
  LMX_PRICE_USD,
  fetchCryptoPrices,
  calculateCryptoCost,
} from "@/lib/price-utils";
import { useAccount } from "wagmi";
import { useTransactionStatus, TransactionStep } from "./useTransactionStatus";
import { useAppKitProvider } from "@reown/appkit/react";
// API endpoint for recording purchases in the database
const API_ENDPOINT = "/api/presale/purchase";

// Master wallet address to receive SOL payments
const MASTER_WALLET_ADDRESS = "F16pJr3MJ7ppC4nd8nxfPrWjfhkGK1qbgmUyMxm3xLoZ"; // Same as presale account for simplicity

// Initial transaction steps
const initialTransactionSteps: TransactionStep[] = [
  {
    id: "wallet-connect",
    title: "Connect Wallet",
    description: "Connect to your Solana wallet",
    status: "pending",
  },
  {
    id: "prepare-transaction",
    title: "Prepare Transaction",
    description: "Calculate token amount and prepare transaction",
    status: "pending",
  },
  {
    id: "send-transaction",
    title: "Send Transaction",
    description: "Sign and send transaction to the Solana network",
    status: "pending",
  },
  {
    id: "verify-transaction",
    title: "Verify Transaction",
    description: "Verify the transaction was successful",
    status: "pending",
  },
  {
    id: "save-allocation",
    title: "Record Purchase",
    description: "Record your token allocation in our database",
    status: "pending",
  },
];

export function useSolanaPresale(tokenAmount: number, referralCode?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const { address } = useAccount(); // Get user's wallet address

  // Initialize transaction status
  const {
    status,
    setCurrentStep,
    nextStep,
    completeTransaction,
    setError,
    resetStatus,
  } = useTransactionStatus(initialTransactionSteps);
  const { walletProvider } = useAppKitProvider<any>("solana");

  // Buy tokens with Solana
  const buyTokens = async () => {
    setIsLoading(true);
    setTransactionSignature(null);
    resetStatus();
    setIsModalOpen(true);

    try {
      // Step 1: Validate token amount and connect wallet
      setCurrentStep("wallet-connect");

      if (tokenAmount <= 0) {
        setError("wallet-connect", "Token amount must be greater than 0");
        toast.error("Token amount must be greater than 0");
        setIsLoading(false);
        return false;
      }

      // Get SOL price from API
      const prices = await fetchCryptoPrices();
      setSolPrice(prices.sol);

      // Check if wallet is available in window (phantom, solflare, etc.)
      if (!window.solana) {
        setError("wallet-connect", "Solana wallet not detected");
        toast.error("Solana wallet not detected");
        setIsLoading(false);
        return false;
      }

      // Connect to wallet if needed
      if (!window.solana.isConnected) {
        try {
          await window.solana.connect();
        } catch (error) {
          setError("wallet-connect", "Failed to connect to Solana wallet");
          toast.error("Failed to connect to Solana wallet");
          setIsLoading(false);
          return false;
        }
      }

      const wallet = walletProvider;

      // Step 2: Prepare transaction
      setCurrentStep("prepare-transaction");

      // Calculate amount in SOL based on token amount and LMX price
      const solAmount = calculateCryptoCost(tokenAmount, "sol", prices);

      // Create Solana connection
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com"
      );

      nextStep(); // Move to next step

      // Step 3: Send transaction
      setCurrentStep("send-transaction");

      // Send transaction using solanaPresale helper
      const success = await solanaPresale.buyTokens(
        connection,
        wallet,
        solAmount,
        referralCode
      );

      if (!success) {
        setError("send-transaction", "Transaction failed or was rejected");
        toast.error("Transaction failed");
        setIsLoading(false);
        return false;
      }

      // Store the transaction signature for use in the UI
      const signature = await wallet.lastTransaction;
      setTransactionSignature(signature);

      nextStep(); // Move to next step

      // Step 4: Verify the transaction
      setCurrentStep("verify-transaction");

      const verificationResponse = await fetch("/api/presale/verify-solana2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature,
        }),
      });

      if (!verificationResponse.ok) {
        const error = await verificationResponse.json();
        console.error("Transaction verification failed:", error);
        setError("verify-transaction", "Transaction verification failed");
        toast.error("Transaction verification failed. Please contact support.");
        setIsLoading(false);
        return false;
      }

      const verificationData = await verificationResponse.json();

      nextStep(); // Move to next step

      // Step 5: Save allocation in database
      setCurrentStep("save-allocation");

      // If transaction was successfully verified, save the allocation in database
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: address || wallet.publicKey.toString(), // Using wallet address as userId
          network: "SOLANA",
          paymentAmount: solAmount,
          paymentCurrency: "SOL",
          lmxTokensAllocated: tokenAmount,
          pricePerLmxInUsdt: LMX_PRICE_USD,
          transactionSignature: signature,
          referralCode:
            referralCode || verificationData.transaction.referralCode || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error saving allocation:", error);
        setError(
          "save-allocation",
          "Failed to record purchase in our database"
        );
        toast.warning(
          "Transaction completed, but there was an error recording your purchase. Please contact support."
        );
        setIsLoading(false);
        return true; // Return true because the blockchain tx succeeded even if our DB record failed
      }

      // Complete all steps
      completeTransaction();
      toast.success(`Successfully purchased ${tokenAmount} LMX tokens!`);
      return true;
    } catch (error: any) {
      console.error("Error in Solana purchase:", error);

      // Determine which step failed based on where the error occurred
      const currentStep = status.currentStepId || "prepare-transaction";
      setError(currentStep, error.message || "An unexpected error occurred");

      toast.error("Failed to complete the purchase. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    buyTokens,
    isLoading,
    solPrice,
    lmxPriceUsd: LMX_PRICE_USD,
    transactionStatus: status,
    isModalOpen,
    closeModal,
    transactionSignature,
  };
}
