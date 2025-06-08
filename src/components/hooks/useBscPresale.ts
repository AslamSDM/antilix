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
  const buyTokens = async () => {
    try {
      // Set referrer if provided
      if (referrer) {
        await setReferrer();
      }

      // Only proceed if we have a valid cost
      if (dynamicCost > 0) {
        await writeContract({
          address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
          abi: presaleAbi,
          functionName: "buyTokens",
          args: [tokenAmount],
          value: dynamicCost,
        });
      } else {
        toast.error("Could not calculate token cost, please try again");
      }
    } catch (error) {
      console.error("Error buying tokens:", error);
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
