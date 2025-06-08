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

    // Look up the referral code in the database
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        username: true,
        verified: true,
      },
    });

    if (!referrer) {
      return NextResponse.json({
        valid: false,
        message: "Invalid referral code",
      });
    }

    if (!referrer.verified) {
      return NextResponse.json({
        valid: false,
        message: "Referral code belongs to an unverified user",
      });
    }

    // Return information about the referral code
    return NextResponse.json({
      valid: true,
      referrerName: referrer.username || "Antilix User",
    });
  } catch (error) {
    console.error("Error validating referral code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
