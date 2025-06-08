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

    // Find the user with all associated data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        referrals: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            verified: true,
          },
        },
        referrer: {
          select: {
            id: true,
            username: true,
            referralCode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response to exclude sensitive information
    const response = {
      id: user.id,
      email: user.email,
      username: user.username,
      referralCode: user.referralCode,
      evmAddress: user.evmAddress,
      solanaAddress: user.solanaAddress,
      evmVerified: user.evmVerified,
      solanaVerified: user.solanaVerified,
      verified: user.verified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      referrer: user.referrer,
      referralsCount: user.referrals.length,
      verifiedReferralsCount: user.referrals.filter(
        (ref: { verified: boolean }) => ref.verified
      ).length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}
