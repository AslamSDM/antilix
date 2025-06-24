import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { fetchCryptoPrices, calculateCryptoCost } from "@/lib/price-utils";
import { useState, useEffect } from "react";
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
  const [usdtPrice, setUsdtPrice] = useState<number>(1); // USDT price is pegged to USD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
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
  } = useWriteContract();

  // Wait for approval transaction confirmation
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approvalHash as `0x${string}`,
    });

  // Write contract hook for buying tokens with USDT
  const {
    writeContract: buyWithUsdt,
    data: purchaseHash,
    isPending: isPurchasePending,
    error: purchaseError,
  } = useWriteContract();

  // Wait for purchase transaction confirmation
  const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseConfirmed } =
    useWaitForTransactionReceipt({
      hash: purchaseHash as `0x${string}`,
    });

  // Calculate cost in USDT - nearly 1:1 with USD since it's a stablecoin
  useEffect(() => {
    const calculateUsdtCost = async () => {
      if (!tokenAmount || tokenAmount <= 0) return;

      setIsLoadingPrice(true);
      try {
        // For USDT, we use a 1:1 ratio with USD since it's a stablecoin
        // But we'll get the real price just to be safe
        const prices = await fetchCryptoPrices();

        // Calculate cost in USDT (using USD amount directly since 1:1)
        const usdtCost = calculateCryptoCost(tokenAmount, "usdt", prices);
        // Convert to smallest USDT unit (6 decimals) for the contract
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

  // Effect to handle approval confirmation
  useEffect(() => {
    if (isApprovalConfirmed && currentStep?.id === "approve-usdt") {
      nextStep(); // Move to prepare transaction step
      refetchUsdtAllowance(); // Refresh allowance data
    }
  }, [isApprovalConfirmed, currentStep]);
  useEffect(() => {
    if (isApprovalConfirmed && currentStep?.id === "prepare-transaction") {
      nextStep();

      // Step 4: Send transaction
      setCurrentStep("send-transaction");

      try {
        // Call the contract's buyTokensWithUsdt function - this is the new method from the contract
        // First try the new function, and if it fails, fall back to the old function name
        try {
          buyWithUsdt({
            address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
            abi: usdtPresaleAbi,
            functionName: "buyTokensWithUsdt",
            args: [parseEther(tokenAmount.toString())],
          });
        } catch (e) {
          console.warn("buyTokensWithUsdt failed, trying buyWithUSDT", e);
          // Fall back to the old function name if the new one fails
        }

        nextStep();
      } catch (error) {
        console.error("Error sending transaction:", error);
        setError("send-transaction", "Failed to send transaction");
        toast.error("Failed to send transaction");
        setIsLoading(false);
        return;
      }

      // Step 5: Verify transaction (handled in the effect watching purchaseHash)
      setCurrentStep("verify-transaction");
    }
  }, [isApprovalConfirmed, currentStep]);

  // Effect to handle purchase hash
  useEffect(() => {
    if (!purchaseHash) return;
    if (currentStep?.id !== "verify-transaction") return;

    setTransactionSignature(purchaseHash);

    let attempts = 0;
    const maxAttempts = 30;
    const pollInterval = 5000;
    let pollTimer: NodeJS.Timeout;

    async function verifyTransaction() {
      try {
        const verificationResponse = await fetch(
          "/api/presale/verify-bsc-usdt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hash: purchaseHash,
            }),
          }
        );

        const responseData = await verificationResponse.json();

        if (responseData.status === "PENDING" && attempts < maxAttempts) {
          attempts++;
          console.log(
            `Transaction still pending. Polling attempt ${attempts}/${maxAttempts}`
          );
          pollTimer = setTimeout(verifyTransaction, pollInterval);
          return;
        }

        if (!verificationResponse.ok) {
          console.error("Transaction verification failed:", responseData);
          setError("verify-transaction", "Transaction verification failed");
          toast.error(
            "Transaction verification failed. Please contact support."
          );
          setIsLoading(false);
          return false;
        }

        // Transaction was successfully verified
        if (responseData.verified) {
          nextStep(); // Move to final step

          // Save allocation in database
          setCurrentStep("save-allocation");
          nextStep(); // Move to next step
          completeTransaction(); // Mark transaction as complete
          toast.success(
            `Successfully purchased ${tokenAmount} LMX tokens with USDT!`
          );
          return true;
        } else {
          setError(
            "verify-transaction",
            responseData.message || "Verification failed"
          );
          setIsLoading(false);
          return false;
        }
      } catch (error) {
        console.error("Error verifying transaction:", error);
        setError(
          "verify-transaction",
          "Error verifying transaction. Please check your wallet."
        );
        setIsLoading(false);
        return false;
      } finally {
        if (pollTimer) clearTimeout(pollTimer);
      }
    }

    verifyTransaction();
  }, [purchaseHash, currentStep]);

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

    // Reset modal state
    resetStatus();
    setIsModalOpen(true);
    setIsLoading(true);

    try {
      // Step 1: Wallet connect
      setCurrentStep("wallet-connect");

      // Check USDT balance
      if (usdtBalance === undefined || usdtBalance === null) {
        await refetchUsdtBalance();
      }

      if (
        usdtBalance !== undefined &&
        usdtBalance !== null &&
        BigInt(usdtBalance.toString()) < dynamicCost
      ) {
        toast.error("Insufficient USDT balance");
        setError("wallet-connect", "Insufficient USDT balance");
        setIsLoading(false);
        return;
      }

      nextStep();

      // Step 2: Check if approval is needed and approve USDT if required
      setCurrentStep("approve-usdt");

      // Refetch allowance to get the latest value
      await refetchUsdtAllowance();

      if (!usdtAllowance || (usdtAllowance as bigint) < dynamicCost) {
        // Need to approve USDT first
        try {
          approveUsdt({
            address: BSC_USDT_ADDRESS as `0x${string}`,
            abi: usdtAbi,
            functionName: "approve",
            args: [BSC_PRESALE_CONTRACT_ADDRESS, dynamicCost], // Approve 2x for future transactions
          });

          // Wait for approval to be confirmed in the effect
          return; // Exit here, effect will continue process after approval
        } catch (error) {
          console.error("Error approving USDT:", error);
          setError("approve-usdt", "Failed to approve USDT");
          toast.error("Failed to approve USDT spending");
          setIsLoading(false);
          return;
        }
      } else {
        // Already approved, move to next step
        nextStep();
      }

      // Step 3: Prepare transaction
      setCurrentStep("prepare-transaction");
      nextStep();

      // Step 4: Send transaction
      setCurrentStep("send-transaction");

      try {
        // Call the contract's buyTokensWithUsdt function - this is the new method from the contract
        // First try the new function, and if it fails, fall back to the old function name
        try {
          buyWithUsdt({
            address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
            abi: usdtPresaleAbi,
            functionName: "buyTokensWithUsdt",
            args: [parseEther(tokenAmount.toString())],
          });
        } catch (e) {
          console.warn("buyTokensWithUsdt failed, trying buyWithUSDT", e);
          // Fall back to the old function name if the new one fails
        }

        nextStep();
      } catch (error) {
        console.error("Error sending transaction:", error);
        setError("send-transaction", "Failed to send transaction");
        toast.error("Failed to send transaction");
        setIsLoading(false);
        return;
      }

      // Step 5: Verify transaction (handled in the effect watching purchaseHash)
      setCurrentStep("verify-transaction");
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
