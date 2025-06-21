import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user with their referral data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        referralCode: true,
        referrals: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count the number of referrals
    const referralCount = user.referrals.length;

    // Calculate the total bonus earned from referrals
    // This gets all purchases made by users who were referred by the current user
    const referralPurchases = await prisma.purchase.findMany({
      where: {
        user: {
          referrerId: user.id,
        },
        status: "COMPLETED",
        referralBonusPaid: true,
      },
      select: {
        lmxTokensAllocated: true,
      },
    });

    // Calculate total bonuses (assuming bonus is some percentage of the tokens allocated)
    const bonusPercentage = 0.05; // 5% bonus
    let totalBonus = referralPurchases.reduce((sum, purchase) => {
      // Calculate the bonus for this referral purchase
      const bonusAmount = purchase.lmxTokensAllocated.mul(
        new Decimal(bonusPercentage)
      );
      return sum.add(bonusAmount);
    }, new Decimal(0));

    return NextResponse.json({
      referralCode: user.referralCode,
      referralCount,
      totalBonus: totalBonus.toString(),
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral stats" },
      { status: 500 }
    );
  }
}
