import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SendOptions,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { LMX_PRICE_USD } from "@/lib/price-utils";

/**
 * Referral Bonus Distribution API
 *
 * This endpoint handles the distribution of referral bonuses for Solana transactions.
 * When a user makes a purchase with a referral code:
 * 1. The referrer receives 10% of the purchase amount in SOL
 * 2. A second-tier recipient receives 10% of the referral bonus (1% of purchase)
 *
 * Requirements:
 * - Valid purchase ID with a referral
 * - Referrer must have a valid Solana address
 * - Purchase must not have already been processed for referral bonus
 *
 * Note: In a production environment, you would need to set up:
 * - DISTRIBUTION_WALLET_PRIVATE_KEY environment variable
 * - SECOND_TIER_WALLET environment variable
 * - Proper private key handling and security measures
 */

// Solana private key for sending tokens - in production, use environment variable
// NEVER store private keys directly in code
const DISTRIBUTION_WALLET_PRIVATE_KEY =
  process.env.DISTRIBUTION_WALLET_PRIVATE_KEY ?? "";

// Second-tier referral wallet to receive 10% of the referral bonus
const SECOND_TIER_WALLET =
  process.env.SECOND_TIER_WALLET ||
  "8FNBidGYxNaPVMDr7BFgbAK7qdYfBxcBvNz1uTosT3cX";

// Validation schema for token distribution
const distributionSchema = z.object({
  purchaseId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { purchaseId } = distributionSchema.parse(body);

    // Find the purchase - use type assertion to work around Prisma type issues
    const purchase = await (prisma as any).purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          select: {
            id: true,
            referrerId: true,
            solanaAddress: true,
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // Check if a referral bonus has already been processed for this purchase
    if (purchase.hasReferralBonus) {
      return NextResponse.json(
        { error: "Referral bonus already processed for this purchase" },
        { status: 400 }
      );
    }

    // Check if the user has a referrer
    if (!purchase.user.referrerId) {
      return NextResponse.json(
        { error: "No referrer found for this purchase" },
        { status: 400 }
      );
    }

    // Find the referrer - use type assertion to work around Prisma type issues
    const referrer = await (prisma as any).user.findUnique({
      where: { id: purchase.user.referrerId },
      select: {
        id: true,
        solanaAddress: true,
      },
    });

    if (!referrer || !referrer.solanaAddress) {
      return NextResponse.json(
        { error: "Referrer not found or doesn't have a Solana address" },
        { status: 400 }
      );
    }

    // Calculate bonus amount (10% of purchase amount in USD)
    const purchaseAmountInSol = parseFloat(purchase.paymentAmount.toString());
    const purchaseAmountInUsd =
      purchaseAmountInSol * purchase.pricePerLmxInUsdt;
    const bonusPercentage = 10; // 10%
    const bonusAmountInUsd = (purchaseAmountInUsd * bonusPercentage) / 100;

    // Get current SOL price to convert USD to SOL
    // In a real implementation, fetch this from a reliable price oracle or API
    const solPriceInUsd = purchase.pricePerLmxInUsdt / LMX_PRICE_USD; // Using the ratio from the purchase
    const bonusAmountInSol = bonusAmountInUsd / solPriceInUsd;

    // Calculate second-tier amount (10% of the bonus)
    const secondTierPercentage = 10; // 10%
    const secondTierAmountInSol =
      (bonusAmountInSol * secondTierPercentage) / 100;
    const referrerAmountInSol = bonusAmountInSol - secondTierAmountInSol;

    // Convert to lamports
    const referrerLamports = Math.floor(referrerAmountInSol * LAMPORTS_PER_SOL);
    const secondTierLamports = Math.floor(
      secondTierAmountInSol * LAMPORTS_PER_SOL
    );

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    // Load the distribution wallet from private key
    const distributionWallet = Keypair.fromSecretKey(
      Buffer.from(DISTRIBUTION_WALLET_PRIVATE_KEY, "hex")
    );

    // Create transaction to send SOL to referrer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: distributionWallet.publicKey,
        toPubkey: new PublicKey(referrer.solanaAddress),
        lamports: referrerLamports,
      })
    );

    // Add second transfer to second-tier wallet
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: distributionWallet.publicKey,
        toPubkey: new PublicKey(SECOND_TIER_WALLET),
        lamports: secondTierLamports,
      })
    );

    // Sign and send
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = distributionWallet.publicKey;
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      distributionWallet,
    ]);

    // Record the bonus in the database (both referrer and second-tier)
    // Use type assertion to work around Prisma type issues
    const referralBonus = await (prisma as any).referralBonus.create({
      data: {
        referrerId: referrer.id,
        purchaseId: purchase.id,
        purchaseAmount: purchase.paymentAmount,
        bonusPercentage,
        bonusAmount: referrerAmountInSol.toString(), // Store as string to preserve precision
        bonusStatus: "PROCESSED", // Mark as processed (in a real impl, you'd wait for confirmation)
      },
    });

    // Update the purchase to mark it as having a referral bonus
    await (prisma as any).purchase.update({
      where: { id: purchase.id },
      data: { hasReferralBonus: true },
    });

    return NextResponse.json({
      success: true,
      message: "Referral bonus distribution recorded",
      data: {
        purchaseId: purchase.id,
        referrerId: referrer.id,
        referrerSolanaAddress: referrer.solanaAddress,
        bonusAmountInUsd,
        bonusAmountInSol,
        secondTierAmountInSol,
        bonusStatus: "PROCESSED",
      },
    });
  } catch (error) {
    console.error("Error distributing referral bonus:", error);
    return NextResponse.json(
      { error: "Failed to distribute referral bonus" },
      { status: 500 }
    );
  }
}
