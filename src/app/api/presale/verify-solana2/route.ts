import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import prisma from "@/lib/prisma";
import {
  calculateTokenAmount,
  fetchCryptoPricesServer,
  LMX_PRICE_USD,
} from "@/lib/price-utils";
import { sendReferralTokens } from "@/lib/send-referral";
import { MASTER_WALLET_ADDRESS } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { ERROR_TYPES } from "@/lib/errors";

// Second-tier referral wallet to receive 10% of the referral bonus
const SECOND_TIER_WALLET =
  process.env.SECOND_TIER_WALLET || MASTER_WALLET_ADDRESS;
const DISTRIBUTION_WALLET_PRIVATE_KEY =
  process.env.DISTRIBUTION_WALLET_PRIVATE_KEY ?? "";

// Validation schema

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: ERROR_TYPES.AUTH_REQUIRED.message,
          code: ERROR_TYPES.AUTH_REQUIRED.code,
        },
        { status: 401 }
      );
    }
    const body = await req.json();
    // const { signature } = verificationSchema.parse(body);
    const { signature } = body;

    // Validate that signature is a string
    if (typeof signature !== "string") {
      return NextResponse.json(
        { error: "Signature must be a string" },
        { status: 400 }
      );
    }

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://mainnet.helius-rpc.com/?api-key=c84ddc95-f80a-480a-b8b0-7df6d2fcc62f" // Use Helius RPC or your preferred RPC endpoint
    );

    console.log("Processing signature:", signature);
    // Fetch transaction details with commitment level and additional details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    // Add retry logic if transaction is null
    if (!transaction) {
      // Wait a bit and try again - transaction might not be finalized yet
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Retrying transaction fetch for:", signature);
      const retryTransaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: "finalized",
      });
      if (retryTransaction) {
        console.log("Transaction found on retry");
        return retryTransaction;
      }
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if the transaction is a transfer to our master wallet
    let isTransferToMasterWallet = false;
    let senderAddress = "";

    try {
      // Get the transaction message object and cast as any to bypass TypeScript errors
      const txMessage = transaction.transaction.message as any;

      // Handle the array of arrays structure we now know exists
      if (txMessage.accountKeys && Array.isArray(txMessage.accountKeys)) {
        // Check for newer transaction format with accountKeys as array of arrays
        if (Array.isArray(txMessage.accountKeys[0])) {
          // Get sender address from the first account in the first array
          if (txMessage.accountKeys[0][0]) {
            senderAddress = txMessage.accountKeys[0][0].toBase58();
          }

          // Check all accounts to find our master wallet
          for (const keyArray of txMessage.accountKeys) {
            if (
              keyArray[0] &&
              keyArray[0].toBase58() === MASTER_WALLET_ADDRESS
            ) {
              isTransferToMasterWallet = true;
              break;
            }
          }
        } else {
          // Handle simple array structure (less common)
          senderAddress = txMessage.accountKeys[0].toBase58();

          isTransferToMasterWallet = txMessage.accountKeys.some(
            (key: PublicKey) => key.toBase58() === MASTER_WALLET_ADDRESS
          );
        }
      }
    } catch (e) {
      console.error("Error processing transaction:", e);
    }

    if (!isTransferToMasterWallet) {
      return NextResponse.json(
        {
          error:
            "Transaction is not a valid transfer to the presale master wallet",
        },
        { status: 400 }
      );
    }

    if (senderAddress !== session.user.solanaAddress) {
      return NextResponse.json(
        { error: "Failed to verify transaction" },
        { status: 500 }
      );
    }

    // Extract transaction amount
    let transferAmount = 0;

    // Use balance difference as a more reliable method of determining transfer amount
    if (transaction.meta?.preBalances && transaction.meta?.postBalances) {
      // Find the sender's balance change (typically index 0)
      const balanceChange =
        transaction.meta.preBalances[0] - transaction.meta.postBalances[0];
      if (balanceChange > 0) {
        transferAmount = balanceChange;
      }
    }

    // // Check if we already have this transaction recorded
    // const existingTransaction = await prisma.purchase.findUnique({
    //   where: { transactionSignature: signature },
    // });

    // if (existingTransaction) {
    //   return NextResponse.json(
    //     {
    //       error: "Transaction already recorded",
    //       purchase: existingTransaction,
    //     },
    //     { status: 200 }
    //   );
    // }
    const existingTransaction = undefined;

    // Extract referral code if present (from memo instruction)

    // If we have a referral code, and this is a new transaction (not existing),
    // save the purchase so we can process referral bonus
    let newPurchase = null;

    let sender = await prisma.user.findFirstOrThrow({
      where: {
        OR: [
          { walletAddress: senderAddress },
          { solanaAddress: senderAddress },
        ],
      },
    });
    if (!sender) {
      // Create new user for this sender
      const newReferralCode = `LMX${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;
      sender = await prisma.user.create({
        data: {
          walletAddress: senderAddress,
          solanaAddress: senderAddress,
          walletType: "solana",
          referralCode: newReferralCode,
          // Only link to referrer if referralCode exists
        },
      });
    }
    console.log(
      `Sender found: ${sender ? sender.id : "No existing user found"}`
    );

    try {
      // Save the purchase
      if (sender) {
        const solAmount = transferAmount / 1_000_000_000; // Convert from lamports to SOL

        // If we have a referrer, process the bonus distribution
        if (sender.referrerId) {
          const referrer = await prisma.user.findUnique({
            where: { id: sender.referrerId },
            select: { id: true, solanaAddress: true },
          });
          if (referrer && referrer.solanaAddress) {
            try {
              await sendReferralTokens(
                referrer.solanaAddress,
                transferAmount / 1_000_000_000, // Convert from lamports to SOL
                "sol"
              );
            } catch (error) {
              console.error("Error sending referral tokens:", error);
              // Don't block the verification response if sending referral tokens fails
            }
          }
        }
      }
    } catch (purchaseError) {
      console.error(
        "Error recording purchase or processing referral:",
        purchaseError
      );
      // Don't block the verification response if saving the purchase fails
    }
    const prices = await fetchCryptoPricesServer();
    const purchase = await (prisma as any).purchase.create({
      data: {
        userId: sender?.id ?? 0,
        network: "SOLANA",
        paymentAmount: transferAmount / 1_000_000_000, // Convert from lamports to SOL
        paymentCurrency: "SOL",
        lmxTokensAllocated: calculateTokenAmount(
          transferAmount / 1_000_000_000,
          "sol",
          prices
        ), // Example: 1 SOL = 100 LMX tokens,
        pricePerLmxInUsdt: LMX_PRICE_USD,
        transactionSignature: signature,
        status: "COMPLETED", // Mark as completed since we already verified it
      },
    });

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        sender: senderAddress,
        amount: transferAmount / 1_000_000_000, // Convert from lamports to SOL
      },
      // Include purchase data if we found it earlier or just created it
      purchase: existingTransaction || newPurchase || purchase,
    });
  } catch (error) {
    console.error("Error verifying Solana transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
