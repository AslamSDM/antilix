import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import prisma from "@/lib/prisma";
import {
  calculateTokenAmount,
  fetchCryptoPrices,
  LMX_PRICE_USD,
} from "@/lib/price-utils";
import { sendReferralTokens } from "@/lib/send-referral";
import { MASTER_WALLET_ADDRESS } from "@/lib/constants";

// Second-tier referral wallet to receive 10% of the referral bonus
const SECOND_TIER_WALLET =
  process.env.SECOND_TIER_WALLET || MASTER_WALLET_ADDRESS;

// Validation schema

export async function POST(req: NextRequest) {
  try {
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
    console.log(transaction.transaction);

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
    let sender = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: senderAddress },
          { solanaAddress: senderAddress },
        ],
      },
    });
    if (referralCode && !existingTransaction) {
      try {
        // Find the referrer by their referral code
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
          select: { id: true, solanaAddress: true },
        });

        // Find or create the sender user

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
            },
          });
          // If we have a referrer, process the bonus distribution
          if (referrer && referrer?.solanaAddress && newPurchase) {
            //   // Calculate bonus amount (10% of purchase amount in USD)
            //   const purchaseAmountInSol = parseFloat(
            //     newPurchase.paymentAmount.toString()
            //   );
            //   const purchaseAmountInUsd =
            //     purchaseAmountInSol *
            //     parseFloat(newPurchase.pricePerLmxInUsdt.toString());
            //   const bonusPercentage = 10; // 10%
            //   const bonusAmountInUsd =
            //     (purchaseAmountInUsd * bonusPercentage) / 100;

            //   // Get current SOL price to convert USD to SOL
            //   // In a real implementation, fetch this from a reliable price oracle or API
            //   const solPriceInUsd =
            //     parseFloat(newPurchase.pricePerLmxInUsdt.toString()) /
            //     LMX_PRICE_USD; // Using the ratio from the purchase
            //   const bonusAmountInSol = bonusAmountInUsd / solPriceInUsd;

            //   // Calculate second-tier amount (10% of the bonus)
            //   const secondTierPercentage = 10; // 10%
            //   const secondTierAmountInSol =
            //     (bonusAmountInSol * secondTierPercentage) / 100;
            //   const referrerAmountInSol =
            //     bonusAmountInSol - secondTierAmountInSol;
            //   // Load the distribution wallet from private key
            //   // Convert to lamports
            //   const referrerLamports = Math.floor(
            //     referrerAmountInSol * LAMPORTS_PER_SOL
            //   );
            //   const secondTierLamports = Math.floor(
            //     secondTierAmountInSol * LAMPORTS_PER_SOL
            //   );

            //   const distributionWallet = Keypair.fromSecretKey(
            //     Buffer.from(DISTRIBUTION_WALLET_PRIVATE_KEY, "hex")
            //   );

            //   // Create transaction to send SOL to referrer
            //   const transaction = new Transaction().add(
            //     SystemProgram.transfer({
            //       fromPubkey: distributionWallet.publicKey,
            //       toPubkey: new PublicKey(referrer.solanaAddress),
            //       lamports: referrerLamports,
            //     })
            //   );

            //   // Add second transfer to second-tier wallet
            //   transaction.add(
            //     SystemProgram.transfer({
            //       fromPubkey: distributionWallet.publicKey,
            //       toPubkey: new PublicKey(SECOND_TIER_WALLET),
            //       lamports: secondTierLamports,
            //     })
            //   );

            //   // Sign and send
            //   transaction.recentBlockhash = (
            //     await connection.getLatestBlockhash()
            //   ).blockhash;
            //   transaction.feePayer = distributionWallet.publicKey;
            //   const signature = await sendAndConfirmTransaction(
            //     connection,
            //     transaction,
            //     [distributionWallet]
            //   );
            await sendReferralTokens(
              referrer.solanaAddress,
              transferAmount / 1_000_000_000, // Convert from lamports to SOL
              "sol"
            );
          }
        }
        const prices = await fetchCryptoPrices();
        const purchase = await (prisma as any).purchase.create({
          data: {
            userId: sender.id,
            network: "solana",
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
