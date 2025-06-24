import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { fetchCryptoPrices, calculateCryptoCost } from "@/lib/price-utils";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useTransactionStatus, TransactionStep } from "./useTransactionStatus";
import {
  BSC_PRESALE_CONTRACT_ADDRESS,
  BSC_USDT_ADDRESS,
} from "@/lib/constants";
import { parseEther } from "ethers";
import { usdtPresaleAbi } from "@/lib/abi-usdt";

// Initial transaction steps for BSC USDT
const initialTransactionSteps: TransactionStep[] = [
  {
    id: "wallet-connect",
    title: "Connect Wallet",
    description: "Connect to your BSC wallet",
    status: "pending",
  },
  {
    id: "approve-usdt",
    title: "Approve USDT",
    description: "Approve USDT spending for the presale contract",
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

// USDT token ABI (ERC20 standard) for approval
const usdtAbi = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export function useBscUsdtPresale(tokenAmount: number, referrer?: string) {
  const [dynamicCost, setDynamicCost] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [usdtPrice, setUsdtPrice] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [approvalCompleted, setApprovalCompleted] = useState(false);
  const [purchaseInitiated, setPurchaseInitiated] = useState(false);
  const { address } = useAccount();

  // Initialize transaction status
  const {
    status: transactionStatus,
    setCurrentStep,
    currentStep,
    nextStep,
    completeTransaction,
    setError,
    resetStatus,
  } = useTransactionStatus(initialTransactionSteps);

  // Check presale status
  const { data: presaleStatus } = useReadContract({
    address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: usdtPresaleAbi,
    functionName: "presaleActive",
  });

  // Check USDT balance
  const { data: usdtBalance, refetch: refetchUsdtBalance } = useReadContract({
    address: BSC_USDT_ADDRESS as `0x${string}`,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  // Check USDT allowance
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } =
    useReadContract({
      address: BSC_USDT_ADDRESS as `0x${string}`,
      abi: usdtAbi,
      functionName: "allowance",
      args: [
        address as `0x${string}`,
        BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
      ],
    });

  // Write contract hook for approving USDT
  const {
    writeContract: approveUsdt,
    data: approvalHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApproval,
  } = useWriteContract();

  // Wait for approval transaction confirmation
  const {
    isLoading: isApprovalConfirming,
    isSuccess: isApprovalConfirmed,
    isError: isApprovalError,
  } = useWaitForTransactionReceipt({
    hash: approvalHash as `0x${string}`,
  });

  // Write contract hook for buying tokens with USDT
  const {
    writeContract: buyWithUsdt,
    data: purchaseHash,
    isPending: isPurchasePending,
    isSuccess: isPurchaseSuccess,
    isError: isPurchaseError,
    error: purchaseError,
    reset: resetPurchase,
  } = useWriteContract();

  // Wait for purchase transaction confirmation
  const {
    isLoading: isPurchaseConfirming,
    isSuccess: isPurchaseConfirmed,
    isError: isPurchaseTransactionError,
  } = useWaitForTransactionReceipt({
    hash: purchaseHash as `0x${string}`,
  });

  // Calculate cost in USDT
  useEffect(() => {
    const calculateUsdtCost = async () => {
      if (!tokenAmount || tokenAmount <= 0) return;

      setIsLoadingPrice(true);
      try {
        const prices = await fetchCryptoPrices();
        const usdtCost = calculateCryptoCost(tokenAmount, "usdt", prices);
        setDynamicCost(parseUnits(usdtCost.toString(), 18));
      } catch (error) {
        console.error("Error calculating token cost:", error);
        toast.error("Error calculating USDT cost. Please try again.");
      } finally {
        setIsLoadingPrice(false);
      }
    };

    calculateUsdtCost();
  }, [tokenAmount]);

  // Handle approval transaction confirmation
  useEffect(() => {
    if (isApprovalConfirmed && !approvalCompleted) {
      console.log("Approval confirmed, proceeding to purchase");
      setApprovalCompleted(true);
      refetchUsdtAllowance();

      // Move to prepare transaction step
      setCurrentStep("prepare-transaction");
      nextStep();

      // Small delay to ensure state updates, then proceed to purchase
      setTimeout(() => {
        initiatePurchase();
      }, 1000);
    }
  }, [isApprovalConfirmed, approvalCompleted]);

  // Handle approval errors
  useEffect(() => {
    if (isApprovalError && approvalHash) {
      console.error("Approval transaction failed");
      setError("approve-usdt", "Approval transaction failed");
      toast.error("USDT approval failed. Please try again.");
      setIsLoading(false);
    }
  }, [isApprovalError, approvalHash]);

  // Handle purchase transaction confirmation
  useEffect(() => {
    if (isPurchaseConfirmed && purchaseHash && !transactionSignature) {
      console.log("Purchase confirmed, starting verification");
      setTransactionSignature(purchaseHash);
      setCurrentStep("verify-transaction");
      nextStep();

      // Start verification process
      verifyTransaction(purchaseHash);
    }
  }, [isPurchaseConfirmed, purchaseHash, transactionSignature]);

  // Handle purchase errors
  useEffect(() => {
    if (isPurchaseTransactionError && purchaseHash) {
      console.error("Purchase transaction failed");
      setError("send-transaction", "Purchase transaction failed");
      toast.error("Purchase transaction failed. Please try again.");
      setIsLoading(false);
    }
  }, [isPurchaseTransactionError, purchaseHash]);

  // Separate function to initiate purchase
  const initiatePurchase = useCallback(async () => {
    if (purchaseInitiated) return;

    console.log("Initiating purchase transaction");
    setPurchaseInitiated(true);

    try {
      setCurrentStep("send-transaction");
      nextStep();

      await buyWithUsdt({
        address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
        abi: usdtPresaleAbi,
        functionName: "buyTokensWithUsdt",
        args: [parseEther(tokenAmount.toString())],
      });

      console.log("Purchase transaction sent");
    } catch (error) {
      console.error("Error sending purchase transaction:", error);
      setError("send-transaction", "Failed to send purchase transaction");
      toast.error("Failed to send purchase transaction");
      setIsLoading(false);
      setPurchaseInitiated(false);
    }
  }, [
    purchaseInitiated,
    buyWithUsdt,
    tokenAmount,
    setCurrentStep,
    nextStep,
    setError,
  ]);

  // Verification function
  const verifyTransaction = useCallback(
    async (hash: string) => {
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = 5000;

      const pollForVerification = async (): Promise<void> => {
        try {
          console.log(
            `Verifying transaction attempt ${attempts + 1}/${maxAttempts}`
          );

          const verificationResponse = await fetch(
            "/api/presale/verify-bsc-usdt",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                hash: hash,
              }),
            }
          );

          const responseData = await verificationResponse.json();
          console.log("Verification response:", responseData);

          if (responseData.status === "PENDING" && attempts < maxAttempts) {
            attempts++;
            setTimeout(pollForVerification, pollInterval);
            return;
          }

          if (!verificationResponse.ok || !responseData.verified) {
            console.error("Transaction verification failed:", responseData);
            setError(
              "verify-transaction",
              responseData.message || "Transaction verification failed"
            );
            toast.error(
              "Transaction verification failed. Please contact support."
            );
            setIsLoading(false);
            return;
          }

          // Success
          console.log("Transaction verified successfully");
          setCurrentStep("save-allocation");
          nextStep();
          completeTransaction();
          toast.success(
            `Successfully purchased ${tokenAmount} LMX tokens with USDT!`
          );
          setIsLoading(false);
        } catch (error) {
          console.error("Error verifying transaction:", error);
          setError(
            "verify-transaction",
            "Error verifying transaction. Please check your wallet."
          );
          toast.error("Error verifying transaction. Please check your wallet.");
          setIsLoading(false);
        }
      };

      // Start polling
      await pollForVerification();
    },
    [setCurrentStep, nextStep, completeTransaction, setError, tokenAmount]
  );

  // Main function to buy tokens with USDT
  const buyTokens = async () => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!presaleStatus) {
      toast.error("Presale is not active");
      return;
    }

    if (tokenAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Reset all states
    resetStatus();
    resetApproval();
    resetPurchase();
    setApprovalCompleted(false);
    setPurchaseInitiated(false);
    setTransactionSignature(null);
    setIsModalOpen(true);
    setIsLoading(true);

    try {
      console.log("Starting buy process");

      // Step 1: Wallet connect
      setCurrentStep("wallet-connect");
      nextStep();

      // Check USDT balance
      await refetchUsdtBalance();

      if (
        usdtBalance !== undefined &&
        BigInt(usdtBalance.toString()) < dynamicCost
      ) {
        toast.error("Insufficient USDT balance");
        setError("wallet-connect", "Insufficient USDT balance");
        setIsLoading(false);
        return;
      }

      // Step 2: Check and handle approval
      setCurrentStep("approve-usdt");
      await refetchUsdtAllowance();

      const currentAllowance = usdtAllowance as bigint;
      console.log(
        "Current allowance:",
        currentAllowance?.toString(),
        "Required:",
        dynamicCost.toString()
      );

      if (!currentAllowance || currentAllowance < dynamicCost) {
        console.log("Approval needed, requesting approval");

        try {
          await approveUsdt({
            address: BSC_USDT_ADDRESS as `0x${string}`,
            abi: usdtAbi,
            functionName: "approve",
            args: [BSC_PRESALE_CONTRACT_ADDRESS, dynamicCost * BigInt(2)], // Approve 2x for future transactions
          });

          console.log("Approval transaction sent");
          // The approval confirmation will be handled by the useEffect above
        } catch (error) {
          console.error("Error requesting approval:", error);
          setError("approve-usdt", "Failed to request USDT approval");
          toast.error("Failed to request USDT approval");
          setIsLoading(false);
          return;
        }
      } else {
        console.log("Sufficient allowance, proceeding directly to purchase");
        setApprovalCompleted(true);
        setCurrentStep("prepare-transaction");
        nextStep();

        setTimeout(() => {
          initiatePurchase();
        }, 500);
      }
    } catch (error) {
      console.error("Error in buy process:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  // Close modal function
  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    resetStatus();
    setApprovalCompleted(false);
    setPurchaseInitiated(false);
    setTransactionSignature(null);
  };

  return {
    buyTokens,
    isLoading,
    isModalOpen,
    closeModal,
    transactionStatus,
    transactionSignature,
    usdtBalance,
    refreshUsdtBalance: refetchUsdtBalance,
  };
}
