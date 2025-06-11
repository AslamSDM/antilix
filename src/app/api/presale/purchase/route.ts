import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for purchases
const purchaseSchema = z.object({
  userId: z.string(),
  network: z.enum(["SOLANA", "BSC"]),
  paymentAmount: z.union([z.number().positive(), z.string()]), // Accept both number and string
  paymentCurrency: z.string(),
  lmxTokensAllocated: z.union([z.number().positive(), z.string()]), // Accept both number and string
  pricePerLmxInUsdt: z.union([z.number().positive(), z.string()]), // Accept both number and string
  transactionSignature: z.string(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      network,
      paymentAmount,
      paymentCurrency,
      lmxTokensAllocated,
      pricePerLmxInUsdt,
      transactionSignature,
      referralCode,
    } = purchaseSchema.parse(body);

    // Check if this transaction has already been recorded
    const existingTransaction = await prisma.purchase.findUnique({
      where: { transactionSignature },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "This transaction has already been recorded" },
        { status: 409 }
      );
    }

    // Verify the transaction on the blockchain
    let isVerified = false;
    let verificationError = null;

    try {
      // Call the appropriate verification endpoint based on network
      const verificationEndpoint =
        network === "SOLANA"
          ? "/api/presale/verify-solana"
          : "/api/presale/verify-bsc";

      const verificationBody =
        network === "SOLANA"
          ? { signature: transactionSignature }
          : { hash: transactionSignature };

      // Use the internal fetch to call our own API endpoints
      const verificationRes = await fetch(
        `${
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        }${verificationEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verificationBody),
        }
      );

      if (verificationRes.ok) {
        const verificationData = await verificationRes.json();

        // If the verification endpoint returned an error property, it means verification failed
        if (verificationData.error) {
          isVerified = false;
          verificationError = verificationData.error;
          console.error(
            "Transaction verification failed:",
            verificationData.error
          );
        } else {
          // If no error and status code is 200, consider it verified
          isVerified = true;

          // If there's existing purchase data from verification, log it
          if (verificationData.purchase) {
            console.log(
              "Transaction already verified:",
              verificationData.purchase
            );
          }
        }
      } else {
        const error = await verificationRes.json();
        verificationError = error.error || "Failed to verify transaction";
        console.error("Transaction verification failed:", error);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      verificationError = "Internal server error during verification";
    }

    // If verification failed, return error
    if (!isVerified) {
      return NextResponse.json(
        {
          error: "Transaction could not be verified on the blockchain",
          details: verificationError,
        },
        { status: 400 }
      );
    }

    // Find user by their wallet address
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: userId },
          { solanaAddress: userId },
          { evmAddress: userId },
        ],
      },
    });

    // If no user found, create a new one with the wallet address
    if (!user) {
      // Generate unique referral code
      const referralCode = `LMX${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;

      // Create user with network-specific wallet address
      user = await prisma.user.create({
        data: {
          walletAddress: userId,
          walletType: network === "SOLANA" ? "solana" : "ethereum",
          // Set the appropriate network-specific address field
          ...(network === "SOLANA"
            ? { solanaAddress: userId }
            : { evmAddress: userId }),
          referralCode,
          verified: false,
        },
      });
    } else if (network === "SOLANA" && !user.solanaAddress) {
      // Update Solana address if not set
      await prisma.user.update({
        where: { id: user.id },
        data: { solanaAddress: userId },
      });
    } else if (network === "BSC" && !user.evmAddress) {
      // Update EVM address if not set
      await prisma.user.update({
        where: { id: user.id },
        data: { evmAddress: userId },
      });
    }

    // Find referrer if referral code was provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Save the purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        network,
        paymentAmount:
          typeof paymentAmount === "number"
            ? paymentAmount.toString()
            : paymentAmount,
        paymentCurrency,
        lmxTokensAllocated:
          typeof lmxTokensAllocated === "number"
            ? lmxTokensAllocated.toString()
            : lmxTokensAllocated,
        pricePerLmxInUsdt:
          typeof pricePerLmxInUsdt === "number"
            ? pricePerLmxInUsdt.toString()
            : pricePerLmxInUsdt,
        transactionSignature,
        status: "COMPLETED", // Mark as completed since we already verified it
      },
    });

    // Process referral aspects
    let wasReferralUpdated = false;
    let shouldProcessBonus = false;
    let effectiveReferrerId = user.referrerId; // Start with any existing referrer

    // If there's a valid new referrer and the user doesn't already have one, update the user
    if (referrerId && !user.referrerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { referrerId },
      });
      wasReferralUpdated = true;
      effectiveReferrerId = referrerId;
      shouldProcessBonus = true;
    }
    // If user already has a referrer, we should still process the bonus
    else if (user.referrerId) {
      shouldProcessBonus = true;
    }

    // Process referral bonus if needed
    if (shouldProcessBonus && effectiveReferrerId) {
      // Import referral service here to avoid circular dependencies
      const { processReferralBonus } = await import("@/lib/referral-service");

      // Process referral bonus asynchronously - don't wait for it to complete
      processReferralBonus(purchase.id).catch((err) => {
        console.error("Error processing referral bonus:", err);
      });
    }

    return NextResponse.json({
      success: true,
      purchase,
      verified: isVerified,
      referralUpdated: wasReferralUpdated,
      referralBonusPending: shouldProcessBonus,
    });
  } catch (error) {
    console.error("Error saving purchase:", error);
    return NextResponse.json(
      { error: "Failed to save purchase" },
      { status: 500 }
    );
  }
}
