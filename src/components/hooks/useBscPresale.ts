import { useWriteContract, useReadContract } from "wagmi";
import { presaleAbi } from "@/lib/abi";
import { parseEther } from "viem";

const BSC_PRESALE_CONTRACT_ADDRESS =
  "0xE413A23494c1EAd5d117e9ee327924D253d08878";

export function useBscPresale(tokenAmount: number, referrer?: string) {
  // Get token price from contract
  const { data: tokenPrice } = useReadContract({
    address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
    abi: presaleAbi,
    functionName: "tokenPrice",
  });

  // Calculate cost in BNB
  const totalCost = tokenPrice
    ? parseEther((Number(tokenPrice) * tokenAmount).toString())
    : BigInt(0);

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
    if (referrer) {
      await setReferrer();
    }

    if (totalCost > 0) {
      writeContract({
        address: BSC_PRESALE_CONTRACT_ADDRESS as `0x${string}`,
        abi: presaleAbi,
        functionName: "buyTokens",
        args: [tokenAmount],
        value: totalCost,
      });
    }
  };

  return {
    buyTokens,
    isLoading: isPending,
    isSuccess,
    error,
    transactionData: data,
  };
}
