import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all referrals for the user
    const referrals = await prisma.user.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        username: true,
        createdAt: true,
        verified: true,
        walletType: true,
        walletVerified: true,
        evmAddress: true,
        evmVerified: true,
        solanaAddress: true,
        solanaVerified: true,
      },
    });

    // Get counts and statistics
    const totalReferrals = referrals.length;
    const verifiedReferrals = referrals.filter((r) => r.verified).length;
    const referralsByWalletType = referrals.reduce((acc, referral) => {
      // If the user has a wallet type, count it
      if (referral.walletType) {
        acc[referral.walletType] = (acc[referral.walletType] || 0) + 1;
      }
      // Also count by specific chain addresses if they exist
      if (referral.solanaAddress) {
        acc["solana"] = (acc["solana"] || 0) + 1;
      }
      if (referral.evmAddress) {
        acc["evm"] = (acc["evm"] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      referralCode: user.referralCode,
      statistics: {
        totalReferrals,
        verifiedReferrals,
        referralsByWalletType,
      },
      referrals,
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to get referrals" },
      { status: 500 }
    );
  }
}
