import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

// Configuration for referral bonuses
const REFERRAL_PERCENTAGE = 5; // 5% bonus for referring someone

/**
 * Process referral bonus for a purchase if the user was referred
 * @param purchaseId - ID of the purchase that might trigger a bonus
 */
export async function processReferralBonus(
  purchaseId: string
): Promise<boolean> {
  try {
    console.log(`Processing referral bonus for purchase ${purchaseId}`);

    // Fetch the purchase with user details
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        user: {
          include: {
            referrer: true, // Get the referrer information
          },
        },
      },
    });

    // Validate purchase exists
    if (!purchase) {
      console.error(`Purchase ${purchaseId} not found`);
      return false;
    }

    // Check if bonus already processed
    if (purchase.hasReferralBonus) {
      console.log(
        `Referral bonus for purchase ${purchaseId} already processed`
      );
      return false;
    }

    // Check if the user has a referrer
    if (!purchase.user.referrerId) {
      console.log(`No referrer for purchase ${purchaseId}`);
      return false;
    }

    // Check if referrer exists
    if (!purchase.user.referrer) {
      console.error(
        `Referrer ID ${purchase.user.referrerId} not found for purchase ${purchaseId}`
      );
      return false;
    }

    // Calculate bonus amount (5% of the tokens purchased)
    const lmxTokensAllocated = new Decimal(
      purchase.lmxTokensAllocated.toString()
    );
    const bonusAmount = lmxTokensAllocated.mul(REFERRAL_PERCENTAGE).div(100);

    // Create the referral bonus record
    try {
      const referralBonus = await prisma.referralBonus.create({
        data: {
          referrerId: purchase.user.referrerId,
          purchaseId: purchase.id,
          purchaseAmount: purchase.lmxTokensAllocated,
          bonusPercentage: REFERRAL_PERCENTAGE,
          bonusAmount: bonusAmount,
          bonusStatus: "PROCESSED", // Mark as processed immediately for now
        },
      });

      // Mark the purchase as having a referral bonus processed
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { hasReferralBonus: true },
      });

      console.log(
        `Processed referral bonus ${referralBonus.id} for purchase ${purchaseId}: ${bonusAmount} LMX tokens`
      );
      return true;
    } catch (error) {
      console.error(
        `Error creating referral bonus record for purchase ${purchaseId}:`,
        error
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error processing referral bonus for purchase ${purchaseId}:`,
      error
    );
    return false;
  }
}

/**
 * Get total referral bonuses for a user
 * @param userId - ID of the user to get bonuses for
 */
export async function getUserReferralBonuses(userId: string) {
  try {
    const bonuses = await prisma.referralBonus.findMany({
      where: {
        referrerId: userId,
        bonusStatus: "PROCESSED",
      },
      include: {
        purchase: {
          select: {
            createdAt: true,
            lmxTokensAllocated: true,
            user: {
              select: {
                walletAddress: true,
                solanaAddress: true,
                evmAddress: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate total bonus amount
    const totalBonus = bonuses.reduce(
      (sum, bonus) => sum.add(bonus.bonusAmount),
      new Decimal(0)
    );

    return {
      bonuses,
      totalBonus: totalBonus.toString(),
      count: bonuses.length,
    };
  } catch (error) {
    console.error("Error getting user referral bonuses:", error);
    throw error;
  }
}
