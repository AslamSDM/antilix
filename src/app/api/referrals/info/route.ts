import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Extract the referral code from the URL query parameters
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing referral code" },
        { status: 400 }
      );
    }

    // Look up the referral code in the database to get user details
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        username: true,
        walletAddress: true,
        verified: true,
      },
    });

    if (!referrer) {
      return NextResponse.json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Return information about the referrer (excluding sensitive data)
    return NextResponse.json({
      success: true,
      referrerId: referrer.id,
      walletAddress: referrer.walletAddress || null,
      username: referrer.username,
      verified: referrer.verified,
    });
  } catch (error) {
    console.error("Error fetching referrer info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
