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

// Max attempts to check transaction status
const MAX_VERIFICATION_ATTEMPTS = 10;
// Delay between verification attempts in ms (5 seconds)
const VERIFICATION_DELAY = 5000;

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

    // Check if we already have tracked this transaction
    let existingTransactionRecord = await (
      prisma as any
    ).transaction.findUnique({
      where: { hash: signature },
      include: {
        completedPurchase: true,
      },
    });

    // If transaction already exists and was completed, return the result
    if (
      existingTransactionRecord?.status === "COMPLETED" &&
      existingTransactionRecord.completedPurchase
    ) {
      return NextResponse.json({
        verified: true,
        transaction: existingTransactionRecord,
        purchase: existingTransactionRecord.completedPurchase,
      });
    }

    // If transaction exists but it's still pending and under max check count, update counter and proceed
    if (
      existingTransactionRecord &&
      existingTransactionRecord.status === "PENDING"
    ) {
      existingTransactionRecord = await (prisma as any).transaction.update({
        where: { id: existingTransactionRecord.id },
        data: {
          checkCount: {
            increment: 1,
          },
          lastChecked: new Date(),
        },
        include: {
          completedPurchase: true,
        },
      });
    }

    // If no existing transaction, create a new one
    if (!existingTransactionRecord) {
      existingTransactionRecord = await (prisma as any).transaction.create({
        data: {
          userId: session.user.id,
          hash: signature,
          status: "PENDING",
          network: "SOLANA",
          // These fields will be updated after verification
          tokenAmount: "0",
          paymentAmount: "0",
          paymentCurrency: "SOL",
        },
      });
    }

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://mainnet.helius-rpc.com/?api-key=c84ddc95-f80a-480a-b8b0-7df6d2fcc62f" // Use Helius RPC or your preferred RPC endpoint
    );

    console.log("Processing signature:", signature);
    // Fetch transaction details with commitment level and additional details
    let transaction = await connection.getTransaction(signature, {
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
        // Assign to transaction instead of returning directly
        transaction = retryTransaction;
      }
    }

    if (!transaction) {
      // If we've exceeded max check count, mark as failed
      if (existingTransactionRecord.checkCount >= MAX_VERIFICATION_ATTEMPTS) {
        await (prisma as any).transaction.update({
          where: { id: existingTransactionRecord.id },
          data: {
            status: "FAILED",
          },
        });

        return NextResponse.json(
          {
            error: "Transaction verification failed after multiple attempts",
            status: "FAILED",
            transaction: existingTransactionRecord,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: "PENDING",
        message:
          "Transaction not yet confirmed on Solana network, will retry verification",
        transaction: existingTransactionRecord,
      });
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
      // Update transaction record to mark as failed
      await (prisma as any).transaction.update({
        where: { id: existingTransactionRecord.id },
        data: {
          status: "FAILED",
        },
      });

      return NextResponse.json(
        {
          error:
            "Transaction is not a valid transfer to the presale master wallet",
          transaction: existingTransactionRecord,
        },
        { status: 400 }
      );
    }

    // if (senderAddress !== session.user.solanaAddress) {
    //   return NextResponse.json(
    //     { error: "Failed to verify transaction" },
    //     { status: 500 }
    //   );
    // }

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

    // Update transaction with the payment amount
    await (prisma as any).transaction.update({
      where: { id: existingTransactionRecord.id },
      data: {
        paymentAmount: transferAmount / 1_000_000_000, // Convert from lamports to SOL
      },
    });

    // Check if we already have this transaction recorded as a purchase
    const existingPurchaseRecord = await prisma.purchase.findUnique({
      where: { transactionSignature: signature },
    });

    if (existingPurchaseRecord) {
      // Update our transaction record to link to the existing purchase
      await (prisma as any).transaction.update({
        where: { id: existingTransactionRecord.id },
        data: {
          status: "COMPLETED",
          completedPurchase: {
            connect: { id: existingPurchaseRecord.id },
          },
        },
      });

      return NextResponse.json(
        {
          verified: true,
          transaction: existingTransactionRecord,
          purchase: existingPurchaseRecord,
        },
        { status: 200 }
      );
    }

    // Extract referral code if present (from memo instruction)

    // If we have a referral code, and this is a new transaction (not existing),
    // save the purchase so we can process referral bonus
    let newPurchase = null;

    let sender = await prisma.user.findFirstOrThrow({
      where: {
        id: session.user.id,
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
    let referralPaid = false;

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
              referralPaid = await sendReferralTokens(
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
    const solAmount = transferAmount / 1_000_000_000; // Convert from lamports to SOL
    const tokenAmount = calculateTokenAmount(solAmount, "sol", prices);

    // Create a new purchase record
    const purchase = await (prisma as any).purchase.create({
      data: {
        userId: sender?.id ?? 0,
        network: "SOLANA",
        paymentAmount: solAmount,
        paymentCurrency: "SOL",
        lmxTokensAllocated: tokenAmount,
        pricePerLmxInUsdt: LMX_PRICE_USD,
        transactionSignature: signature,
        referralBonusPaid: referralPaid,
        status: "COMPLETED", // Mark as completed since we already verified it
        transactionId: existingTransactionRecord.id, // Link to the transaction record
      },
    });

    // Update transaction record with token and payment info
    const updatedTransaction = await (prisma as any).transaction.update({
      where: { id: existingTransactionRecord.id },
      data: {
        status: "COMPLETED",
        tokenAmount: tokenAmount.toString(),
        paymentAmount: solAmount.toString(),
      },
      include: {
        completedPurchase: true,
      },
    });

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        sender: senderAddress,
        amount: solAmount,
      },
      // Include the new purchase
      purchase: purchase,
      transactionRecord: updatedTransaction,
    });
  } catch (error) {
    console.error("Error verifying Solana transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
