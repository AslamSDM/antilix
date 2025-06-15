import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import { fetchCryptoPrices } from "./price-utils";
import { MASTER_WALLET_ADDRESS } from "./constants";
const DISTRIBUTION_WALLET_PRIVATE_KEY =
  process.env.DISTRIBUTION_WALLET_PRIVATE_KEY ?? "";

// Second-tier referral wallet to receive 10% of the referral bonus
const SECOND_TIER_WALLET =
  process.env.SECOND_TIER_WALLET || MASTER_WALLET_ADDRESS;
export async function sendReferralTokens(
  referrer: string,
  value: number,
  chain: "sol" | "bsc"
) {
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://mainnet.helius-rpc.com/?api-key=c84ddc95-f80a-480a-b8b0-7df6d2fcc62f"
    );

    // Your SPL token mint address
    const TOKEN_MINT = new PublicKey(
      "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN"
    );
    const TOKEN_DECIMALS = 9; // Adjust based on your token's decimals

    // Calculate bonus amount (10% of purchase amount in USD)
    const prices = await fetchCryptoPrices();
    let purchaseAmountInUsd = 0;

    if (chain === "bsc") {
      purchaseAmountInUsd = parseFloat((value * prices.bnb).toString());
    } else {
      purchaseAmountInUsd = parseFloat((value * prices.sol).toString());
    }

    const bonusPercentage = 10; // 10%
    const bonusAmountInUsd = (purchaseAmountInUsd * bonusPercentage) / 100;

    // Get current token price to convert USD to token amount
    //
    const tokenPriceInUsd = parseFloat(prices.bnb.toString()); // Replace with your token price
    const bonusAmountInTokens = bonusAmountInUsd / tokenPriceInUsd;

    // Calculate second-tier amount (10% of the bonus)
    const secondTierPercentage = 10; // 10%
    const secondTierAmountInTokens =
      (bonusAmountInTokens * secondTierPercentage) / 100;
    const referrerAmountInTokens =
      bonusAmountInTokens - secondTierAmountInTokens;

    // Convert to token's smallest unit (considering decimals)
    const referrerTokenAmount = Math.floor(
      referrerAmountInTokens * Math.pow(10, TOKEN_DECIMALS)
    );
    const secondTierTokenAmount = Math.floor(
      secondTierAmountInTokens * Math.pow(10, TOKEN_DECIMALS)
    );

    const distributionWallet = Keypair.fromSecretKey(
      Buffer.from(DISTRIBUTION_WALLET_PRIVATE_KEY, "hex")
    );

    // Helper function to create ATA if it doesn't exist
    async function createATAIfNeeded(
      connection: Connection,
      payer: PublicKey,
      mint: PublicKey,
      owner: PublicKey,
      transaction: Transaction
    ) {
      const ata = await getAssociatedTokenAddress(mint, owner);

      try {
        await getAccount(connection, ata);
        // Account exists, no need to create
      } catch (error) {
        // Account doesn't exist, create it
        const createATAInstruction = createAssociatedTokenAccountInstruction(
          payer,
          ata,
          owner,
          mint
        );
        transaction.add(createATAInstruction);
      }

      return ata;
    }

    try {
      const transaction = new Transaction();

      // Get or create associated token accounts
      const distributionTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        distributionWallet.publicKey
      );

      const referrerTokenAccount = await createATAIfNeeded(
        connection,
        distributionWallet.publicKey,
        TOKEN_MINT,
        new PublicKey(referrer),
        transaction
      );

      const secondTierTokenAccount = await createATAIfNeeded(
        connection,
        distributionWallet.publicKey,
        TOKEN_MINT,
        new PublicKey(SECOND_TIER_WALLET),
        transaction
      );

      // Create transfer instruction to referrer
      const transferToReferrerInstruction = createTransferInstruction(
        distributionTokenAccount,
        referrerTokenAccount,
        distributionWallet.publicKey,
        referrerTokenAmount,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(transferToReferrerInstruction);

      // Create transfer instruction to second-tier wallet
      const transferToSecondTierInstruction = createTransferInstruction(
        distributionTokenAccount,
        secondTierTokenAccount,
        distributionWallet.publicKey,
        secondTierTokenAmount,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(transferToSecondTierInstruction);

      // Sign and send
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = distributionWallet.publicKey;

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [distributionWallet]
      );

      console.log("Transaction signature:", signature);
    } catch (error) {
      console.error("Error sending SPL tokens:", error);
    }
  } catch (error) {
    console.error("Error processing referral bonus:", error);
  }
}
