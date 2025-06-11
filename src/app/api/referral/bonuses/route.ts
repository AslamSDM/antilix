import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserReferralBonuses } from "@/lib/referral-service";

export async function GET(req: NextRequest) {
  try {
    // Get the user's wallet address from the query parameters
    const walletAddress = req.nextUrl.searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find the user by their wallet address
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress },
          { solanaAddress: walletAddress },
          { evmAddress: walletAddress },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ bonuses: [], totalBonus: "0", count: 0 });
    }

    // Get the user's referral bonuses
    const bonusData = await getUserReferralBonuses(user.id);

    // Get count of referrals
    const referralCount = await prisma.user.count({
      where: {
        referrerId: user.id,
      },
    });

    return NextResponse.json({
      ...bonusData,
      referralCount,
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error("Error getting referral bonuses:", error);
    return NextResponse.json(
      { error: "Failed to get referral bonuses" },
      { status: 500 }
    );
  }
}
