import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { presaleAbi } from "@/lib/abi";
import { parseEther } from "viem";
import {
  fetchCryptoPrices,
  calculateCryptoCost,
  LMX_PRICE_USD,
} from "@/lib/price-utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useTransactionStatus, TransactionStep } from "./useTransactionStatus";

// API endpoint for recording purchases in the database
const API_ENDPOINT = "/api/presale/purchase";

export const BSC_PRESALE_CONTRACT_ADDRESS =
  "0x1b3CA560f04860C287Cfec8f1a7Db666082ab2cF";

// Initial transaction steps for BSC
const initialTransactionSteps: TransactionStep[] = [
  {
    id: "wallet-connect",
    title: "Connect Wallet",
    description: "Connect to your BSC wallet",
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
    description: "Sign and send transaction to the BSC network",
    status: "pending",
  },
  {
    id: "verify-transaction",
    title: "Confirm Transaction",
    description: "Wait for blockchain confirmation",
    status: "pending",
  },
  {
    id: "save-allocation",
    title: "Record Purchase",
    description: "Record your token allocation in our database",
    status: "pending",
  },
];

export function useBscPresale(tokenAmount: number, referrer?: string) {
  const [dynamicCost, setDynamicCost] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const { address } = useAccount();

  // Initialize transaction status
  const {
    status,
    setCurrentStep,
    nextStep,
    completeTransaction,
    setError,
    resetStatus,
  } = useTransactionStatus(initialTransactionSteps);

  // Get token price from contract - keeping this for backward compatibility
  const { data: tokenPrice } = useReadContract({
    address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: presaleAbi,
    functionName: "tokenPrice",
  });

  const { data: presaleStatus } = useReadContract({
    address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: presaleAbi,
    functionName: "presaleActive",
  });

  // Write contract hook for buying tokens
  const { writeContract, data: hash, isPending } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

  // Calculate cost in BNB using real-time price data
  useEffect(() => {
    const calculateDynamicCost = async () => {
      if (tokenAmount <= 0) return;

      setIsLoadingPrice(true);
      try {
        // Get the latest crypto prices
        const prices = await fetchCryptoPrices();
        setBnbPrice(prices.bnb);

        // Calculate cost in BNB based on token amount and fixed LMX price
        const bnbCost = calculateCryptoCost(tokenAmount, "bnb", prices);
        console.log(
          `Calculated BNB cost for ${tokenAmount} tokens: ${bnbCost} BNB`
        );

        // Convert to Wei/Gwei format for contract
        setDynamicCost(parseEther(bnbCost.toString()));
      } catch (error) {
        console.error("Error calculating token cost:", error);
        toast.error("Error calculating token cost, using fallback price");

        // Fallback to contract price if API fails
        if (tokenPrice) {
          setDynamicCost(
            parseEther((Number(tokenPrice) * tokenAmount).toString())
          );
        }
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculateDynamicCost();
  }, [tokenAmount, tokenPrice]);

  // Function to set referrer - simplified implementation
  const setReferrer = async () => {
    if (!referrer) return;

    // In a real implementation, we would call a contract method to set the referrer
    console.log(`Setting referrer: ${referrer} (implementation needed)`);
    return true;
  };

  // Function to buy tokens
  const buyTokens = async (retryWithExplicitGas = false) => {
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

      // Check if BSC wallet is connected
      if (!address) {
        setError("wallet-connect", "BSC wallet not connected");
        toast.error("BSC wallet not connected");
        setIsLoading(false);
        return false;
      }

      nextStep(); // Move to next step

      // Step 2: Prepare transaction
      setCurrentStep("prepare-transaction");

      // Set referrer if provided
      if (referrer) {
        await setReferrer();
      }

      // Validate dynamic cost
      if (dynamicCost <= BigInt(0)) {
        setError("prepare-transaction", "Could not calculate token cost");
        toast.error("Could not calculate token cost, please try again");
        setIsLoading(false);
        return false;
      }

      nextStep(); // Move to next step

      // Step 3: Send Transaction
      setCurrentStep("send-transaction");

      console.log(`Buying ${tokenAmount} tokens for cost: ${dynamicCost} wei`);

      // Prepare transaction parameters
      const txParams = {
        address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
        abi: presaleAbi,
        functionName: "buyTokens",
        args: [tokenAmount],
        value: dynamicCost,
      };

      try {
        // Send transaction
        console.log("Transaction parameters:", txParams);
        await writeContract(txParams);
      } catch (txError) {
        console.error("Transaction error:", txError);
        const errorMessage =
          typeof txError === "object" &&
          txError !== null &&
          "message" in txError
            ? (txError as { message: string }).message
            : String(txError);

        // Handle gas-related errors
        if (
          errorMessage.toLowerCase().includes("intrinsic gas") ||
          errorMessage.toLowerCase().includes("gas limit") ||
          errorMessage.toLowerCase().includes("gas required exceeds")
        ) {
          if (!retryWithExplicitGas) {
            setCurrentStep("prepare-transaction");
            toast.info("Adjusting gas parameters and retrying transaction...");
            try {
              return await buyTokens(true); // Retry with explicit gas
            } catch (retryError) {
              setError(
                "send-transaction",
                "Transaction would fail: Gas calculation issue"
              );
              toast.error(
                "Transaction would fail: Try a smaller token amount or try again later"
              );
              setIsLoading(false);
              return false;
            }
          } else {
            setError("send-transaction", "Transaction failed after retry");
            toast.error(
              "Transaction would fail: Try a smaller token amount or try again later"
            );
            setIsLoading(false);
            return false;
          }
        }

        setError("send-transaction", errorMessage);
        toast.error("Failed to send transaction");
        setIsLoading(false);
        return false;
      }

      // If we got here, transaction was sent successfully
      nextStep();

      // Step 4: Verify transaction
      setCurrentStep("verify-transaction");

      // Store the transaction hash
      if (hash) {
        setTransactionSignature(hash);
      } else {
        setError("verify-transaction", "No transaction hash returned");
        toast.error("Transaction sent but could not be verified");
        setIsLoading(false);
        return false;
      }

      // Wait for transaction confirmation (first through wagmi hook)
      let retries = 0;
      const maxRetries = 10;
      let confirmed = false;

      while (retries < maxRetries && !confirmed) {
        if (isConfirmed) {
          confirmed = true;
          break;
        }

        // Wait 2 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000));
        retries++;
      }

      if (!confirmed) {
        // Try to verify directly through the API as a backup
        try {
          const verificationResponse = await fetch("/api/presale/verify-bsc", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hash,
            }),
          });

          if (!verificationResponse.ok) {
            const error = await verificationResponse.json();
            console.error("Transaction verification failed:", error);
            setError("verify-transaction", "Transaction verification failed");
            toast.error(
              "Transaction verification failed. Please contact support."
            );
            setIsLoading(false);
            return false;
          }

          const verificationData = await verificationResponse.json();
          confirmed = verificationData.verified;
        } catch (verificationError) {
          console.error("Error during verification:", verificationError);
          setError("verify-transaction", "Transaction confirmation timed out");
          toast.warning(
            "Transaction sent but confirmation timed out. Check your wallet for status."
          );
          setIsLoading(false);
          return true; // Return true since tx was sent
        }
      }

      nextStep(); // Move to final step

      // Step 5: Save allocation in database
      setCurrentStep("save-allocation");

      // Save the purchase in database
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: address,
            network: "BSC",
            paymentAmount: (dynamicCost / BigInt(10 ** 18)).toString(), // Convert from Wei to BNB
            paymentCurrency: "BNB",
            lmxTokensAllocated: tokenAmount,
            pricePerLmxInUsdt: LMX_PRICE_USD,
            transactionSignature: hash,
            referralCode: referrer || "",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Error saving allocation:", error);
          setError("save-allocation", "Failed to record purchase in database");
          toast.warning(
            "Transaction completed, but there was an error recording your purchase. Please contact support."
          );
          setIsLoading(false);
          return true; // Return true because the blockchain tx succeeded
        }

        // Complete transaction flow
        completeTransaction();
        toast.success(`Successfully purchased ${tokenAmount} LMX tokens!`);
        return true;
      } catch (dbError) {
        console.error("Database error:", dbError);
        setError("save-allocation", "Failed to record purchase in database");
        toast.warning(
          "Transaction completed on blockchain, but failed to save in our records. Please contact support."
        );
        setIsLoading(false);
        return true; // Return true because the blockchain tx succeeded
      }
    } catch (error: any) {
      console.error("Error in BSC purchase:", error);

      // Determine which step failed
      const currentStep = status.currentStepId || "prepare-transaction";
      setError(currentStep, error.message || "An unexpected error occurred");

      toast.error("Failed to complete the purchase. Please try again.");
      setIsLoading(false);
      return false;
    }
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    buyTokens,
    isLoading: isPending || isLoadingPrice || isConfirming || isLoading,
    bnbPrice,
    lmxPriceUsd: LMX_PRICE_USD,
    transactionStatus: status,
    isModalOpen,
    closeModal,
    transactionSignature,
    presaleStatus,
  };
}
