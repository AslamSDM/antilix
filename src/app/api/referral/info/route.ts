import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const referralCode = req.nextUrl.searchParams.get("code");

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Find the referrer by the code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        username: true,
        walletType: true,
        // Don't return sensitive fields
        _count: {
          select: {
            referrals: true, // Count of users referred
          },
        },
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Get total bonuses earned from this referral code
    const totalBonuses = await prisma.referralBonus.aggregate({
      where: {
        referrerId: referrer.id,
      },
      _sum: {
        bonusAmount: true,
      },
      _count: true,
    });

    // Return referral information
    return NextResponse.json({
      referrerInfo: {
        id: referrer.id,
        username: referrer.username || "Anonymous",
        walletType: referrer.walletType,
      },
      stats: {
        referralCount: referrer._count.referrals,
        bonusTransactions: totalBonuses._count,
        totalBonusAmount: totalBonuses._sum.bonusAmount?.toString() || "0",
      },
      isValid: true,
    });
  } catch (error) {
    console.error("Error getting referral info:", error);
    return NextResponse.json(
      { error: "Failed to get referral information" },
      { status: 500 }
    );
  }
}
