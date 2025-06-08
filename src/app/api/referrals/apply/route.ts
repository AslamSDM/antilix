import { NextRequest, NextResponse } from "next/server";
import { validateReferralCode, applyReferral } from "@/lib/referral-utils";
import prisma from "@/lib/prisma";

// This route handles applying a referral code during registration
export async function POST(req: NextRequest) {
  try {
    const { userId, referralCode } = await req.json();

    if (!userId || !referralCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, referrerId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If user already has a referrer, don't override it
    if (user.referrerId) {
      return NextResponse.json({
        success: false,
        message: "User already has a referrer",
      });
    }

    // Validate the referral code and get the referrer ID
    const referrerId = await validateReferralCode(referralCode);

    if (!referrerId) {
      return NextResponse.json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Apply the referral
    const success = await applyReferral(userId, referrerId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Referral applied successfully",
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Failed to apply referral",
      });
    }
  } catch (error) {
    console.error("Error applying referral code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
