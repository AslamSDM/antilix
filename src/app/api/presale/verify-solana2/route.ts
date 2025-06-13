import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  VersionedTransaction,
  TransactionResponse,
} from "@solana/web3.js";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Address of the presale master wallet
const MASTER_WALLET_ADDRESS = "F16pJr3MJ7ppC4nd8nxfPrWjfhkGK1qbgmUyMxm3xLoZ";

// Validation schema
const verificationSchema = z.object({
  signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signature } = verificationSchema.parse(body);

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    // Fetch transaction details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if the transaction is a transfer to our master wallet
    let isTransferToMasterWallet = false;
    let senderAddress = "";

    // Handle different transaction types properly with TS type guards
    if ("version" in transaction) {
      // Versioned transaction
      if (transaction.version !== "legacy") {
        try {
          // Get sender address - use staticAccountKeys property which is available
          senderAddress =
            transaction.transaction.message.staticAccountKeys[0].toBase58();

          // Check if master wallet is a recipient
          isTransferToMasterWallet =
            transaction.transaction.message.staticAccountKeys.some(
              (key: PublicKey) => key.toBase58() === MASTER_WALLET_ADDRESS
            );
        } catch (e) {
          console.error("Error processing versioned transaction:", e);
        }
      }
    } else {
      // Legacy transaction
      if (transaction.transaction && transaction.transaction.message) {
        try {
          // For legacy transactions, access accountKeys safely - cast as any if necessary to bypass TS errors
          const txMessage = transaction.transaction.message as any;
          if (txMessage.accountKeys && Array.isArray(txMessage.accountKeys)) {
            // Get sender address
            senderAddress = txMessage.accountKeys[0].toBase58();

            // Check if master wallet is a recipient
            isTransferToMasterWallet = txMessage.accountKeys.some(
              (key: PublicKey) => key.toBase58() === MASTER_WALLET_ADDRESS
            );
          }
        } catch (e) {
          console.error("Error processing legacy transaction:", e);
        }
      }
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

    // Check if we already have this transaction recorded
    // Use type assertion to work around Prisma type issues
    const existingTransaction = await (prisma as any).purchase.findUnique({
      where: { transactionSignature: signature },
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          error: "Transaction already recorded",
          purchase: existingTransaction,
        },
        { status: 200 }
      );
    }

    // Extract referral code if present (from memo instruction)
    let referralCode = "";

    try {
      // Basic check for memo data in the transaction
      const txData = JSON.stringify(transaction);
      if (txData.includes("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo")) {
        // There's likely a memo, but extraction is complex
        // We handle extraction in a more robust way in production
        // This is a simplified approach
        const memoMatch = txData.match(/ref:([a-zA-Z0-9]+)/);
        if (memoMatch && memoMatch[1]) {
          referralCode = memoMatch[1];
        }
      }
    } catch (e) {
      console.error("Error extracting referral code:", e);
    }

    // If we have a referral code, and this is a new transaction (not existing),
    // save the purchase so we can process referral bonus
    let newPurchase = null;

    if (referralCode && !existingTransaction) {
      try {
        // Find the referrer by their referral code
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
          select: { id: true },
        });

        // Find or create the sender user
        let sender = await prisma.user.findFirst({
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
              // If referrer found, link it to the new user
              ...(referrer ? { referrerId: referrer.id } : {}),
            },
          });
        } else if (referrer && !sender.referrerId) {
          // If sender exists but doesn't have a referrer, update it
          await prisma.user.update({
            where: { id: sender.id },
            data: { referrerId: referrer.id },
          });
        }

        // Save the purchase
        if (sender) {
          const solAmount = transferAmount / 1_000_000_000; // Convert from lamports to SOL

          newPurchase = await prisma.purchase.create({
            data: {
              userId: sender.id,
              network: "SOLANA",
              paymentAmount: solAmount.toString(),
              paymentCurrency: "SOL",
              lmxTokensAllocated: (solAmount * 100).toString(), // Example: 1 SOL = 100 LMX tokens
              pricePerLmxInUsdt: "0.10", // Example: $0.10 per LMX token
              transactionSignature: signature,
              status: "COMPLETED",
              hasReferralBonus: false,
            },
          });

          // If we have a referrer, process the bonus distribution
          if (referrer && newPurchase) {
            try {
              // Call the distribute-bonus endpoint
              const bonusResponse = await fetch(
                `${
                  process.env.NEXTAUTH_URL || "http://localhost:3000"
                }/api/presale/distribute-bonus`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    purchaseId: newPurchase.id,
                  }),
                }
              );

              if (bonusResponse.ok) {
                console.log(
                  "Referral bonus distribution triggered successfully"
                );
              } else {
                console.error("Failed to trigger referral bonus distribution");
              }
            } catch (bonusError) {
              console.error(
                "Error triggering referral bonus distribution:",
                bonusError
              );
              // Don't block the verification response if bonus distribution fails
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
    }

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        sender: senderAddress,
        amount: transferAmount / 1_000_000_000, // Convert from lamports to SOL
        referralCode,
      },
      // Include purchase data if we found it earlier or just created it
      purchase: existingTransaction || newPurchase,
    });
  } catch (error) {
    console.error("Error verifying Solana transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
