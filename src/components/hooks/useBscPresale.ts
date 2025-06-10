import { useWriteContract, useReadContract } from "wagmi";
import { presaleAbi } from "@/lib/abi";
import { parseEther } from "viem";
import {
  fetchCryptoPrices,
  calculateCryptoCost,
  LMX_PRICE_USD,
} from "@/lib/price-utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const BSC_PRESALE_CONTRACT_ADDRESS =
  "0xE413A23494c1EAd5d117e9ee327924D253d08878";

export function useBscPresale(tokenAmount: number, referrer?: string) {
  const [dynamicCost, setDynamicCost] = useState<bigint>(BigInt(0));
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);

  // Get token price from contract - keeping this for backward compatibility
  const { data: tokenPrice } = useReadContract({
    address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: presaleAbi,
    functionName: "tokenPrice",
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

  // Use the write contract hook directly
  const { writeContract, data, isPending, isSuccess, error } =
    useWriteContract();

  // Function to set referrer - simplified implementation
  const setReferrer = async () => {
    if (!referrer) return;

    // In a real implementation, we would call a contract method to set the referrer
    console.log(`Setting referrer: ${referrer} (implementation needed)`);
    return true;
  };

  // Function to buy tokens
  const buyTokens = async (retryWithExplicitGas = false) => {
    try {
      // Set referrer if provided
      if (referrer) {
        await setReferrer();
      }

      // Only proceed if we have a valid cost
      if (dynamicCost > 0) {
        console.log(
          `Buying ${tokenAmount} tokens for cost: ${dynamicCost} wei`
        );
        // Prepare transaction parameters
        const txParams: any = {
          address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
          abi: presaleAbi,
          functionName: "buyTokens",
          args: [tokenAmount],
          value: dynamicCost,
          gas: BigInt(100000000),
        };

        await writeContract(txParams);
      } else {
        toast.error("Could not calculate token cost, please try again");
      }
    } catch (error) {
      console.error("Error buying tokens:", error);

      // Check for intrinsic gas related errors
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error);

      if (
        errorMessage.toLowerCase().includes("intrinsic gas") ||
        errorMessage.toLowerCase().includes("gas limit") ||
        errorMessage.toLowerCase().includes("gas required exceeds")
      ) {
        // If this is the first attempt and it's a gas error, try once more with explicit gas values
        if (!retryWithExplicitGas) {
          toast.info("Adjusting gas parameters and retrying transaction...");
          try {
            return await buyTokens(true); // Retry with explicit gas
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            toast.error(
              "Transaction would fail: The network couldn't process this transaction. Try a smaller token amount or try again later when network congestion decreases."
            );
          }
        } else {
          // We already retried, still failing
          toast.error(
            "Transaction would fail: The network couldn't process this transaction. Try a smaller token amount or try again later."
          );
        }
      } else {
        // Handle other errors
        toast.error("Failed to complete transaction. Please try again later.");
      }

      throw error;
    }
  };

  return {
    buyTokens,
    isLoading: isPending || isLoadingPrice,
    isSuccess,
    error,
    transactionData: data,
    bnbPrice,
    dynamicCost,
    lmxPriceUsd: LMX_PRICE_USD,
  };
}
