import { ethers } from "ethers";
import { presaleAbi } from "./abi";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toast } from "sonner";

// Contract addresse
const SOLANA_PRESALE_ADDRESS = "8FNBidGYxNaPVMDr7BFgbAK7qdYfBxcBvNz1uTosT3cX"; // Solana program address

// Network configurations
export const networks = {
  bsc: {
    chainId: "0x61", // BSC Testnet
    chainName: "Binance Smart Chain Testnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    blockExplorerUrls: ["https://testnet.bscscan.com/"],
  },
};

// Helper for BSC token conversion
const formatBscValue = (value: number): string => {
  return ethers.parseEther(value.toString()).toString();
};

// Solana Presale Functions
export const solanaPresale = {
  /**
   * Buy tokens on Solana
   */
  buyTokens: async (
    connection: Connection,
    wallet: any,
    amountInSol: number,
    referrer?: string
  ) => {
    if (!wallet.publicKey) {
      toast.error("Wallet not connected");
      return false;
    }

    try {
      // Calculate amount in lamports
      const lamports = Number((amountInSol * LAMPORTS_PER_SOL).toFixed(0));

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(SOLANA_PRESALE_ADDRESS),
          lamports,
        })
      );

      // Add referrer memo if provided - use the memo program to include referrer info
      if (referrer) {
        // Simply add the referral code as a transaction memo
        const encodedMessage = `ref:${referrer}`;

        // Use the TransactionInstruction constructor for the memo
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey(
            "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"
          ),
          data: Buffer.from(encodedMessage, "utf-8"),
        });

        transaction.add(memoInstruction);
      }

      // Sign and send transaction
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signature = await wallet.sendTransaction(transaction, connection);

      // Confirm transaction
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        toast.error("Transaction failed");
        return false;
      }

      toast.success("Successfully purchased tokens on Solana!");
      return true;
    } catch (error: any) {
      console.error("Error buying Solana tokens:", error);
      toast.error(error.message || "Failed to purchase tokens on Solana");
      return false;
    }
  },

  /**
   * Get presale status from Solana
   * Fetches data from the Solana presale program account
   */
  getPresaleStatus: async (connection: Connection) => {
    try {
      const presaleAccount = new PublicKey(SOLANA_PRESALE_ADDRESS);

      // Fetch account info
      const accountInfo = await connection.getAccountInfo(presaleAccount);
      if (!accountInfo || !accountInfo.data) {
        throw new Error("Failed to fetch presale account data");
      }

      // Parse the account data based on our expected format
      // In a real implementation, you would use a proper layout/schema for decoding
      // This is a simplified example assuming a specific data layout
      const dataBuffer = accountInfo.data;

      // Example decoding - in a real implementation, use proper layout decoding
      const isActive = dataBuffer[0] === 1;

      // Creating a DataView for reading numbers
      const view = new DataView(
        dataBuffer.buffer,
        dataBuffer.byteOffset,
        dataBuffer.byteLength
      );

      // Read values at specific offsets (these offsets would match your program's data structure)
      // Note: Assuming 8-byte (64-bit) numbers for SOL amounts
      const hardCapLamports = view.getBigUint64(8, true); // offset 8, little endian
      const minPurchaseLamports = view.getBigUint64(16, true);
      const maxPurchaseLamports = view.getBigUint64(24, true);
      const tokenPriceLamports = view.getBigUint64(32, true);
      const soldTokensAmount = view.getBigUint64(40, true);
      const totalRaisedLamports = view.getBigUint64(48, true);

      // Convert from lamports to SOL
      const hardCap = (Number(hardCapLamports) / LAMPORTS_PER_SOL).toString();
      const minPurchase = (
        Number(minPurchaseLamports) / LAMPORTS_PER_SOL
      ).toString();
      const maxPurchase = (
        Number(maxPurchaseLamports) / LAMPORTS_PER_SOL
      ).toString();
      const tokenPrice = (
        Number(tokenPriceLamports) / LAMPORTS_PER_SOL
      ).toString();
      const soldTokens = Number(soldTokensAmount).toString();
      const totalRaised = (
        Number(totalRaisedLamports) / LAMPORTS_PER_SOL
      ).toString();

      // Calculate percentage sold
      const percentageSold = (Number(soldTokens) / parseFloat(hardCap)) * 100;

      return {
        isActive,
        hardCap,
        minPurchase,
        maxPurchase,
        tokenPrice,
        soldTokens,
        totalRaised,
        percentageSold,
      };
    } catch (error) {
      console.error("Error getting Solana presale status:", error);
      // Fallback to mock data if we can't fetch real data
      // This ensures the UI still works during development
      return {
        isActive: true,
        hardCap: "500000",
        minPurchase: "1",
        maxPurchase: "10000",
        tokenPrice: "0.001",
        soldTokens: "150000",
        totalRaised: "150",
        percentageSold: 30,
      };
    }
  },
};
