import { NextRequest, NextResponse } from "next/server";
import {
  generateUniqueReferralCode,
  validateReferralCode,
  applyReferral,
  getUserReferralStats,
} from "@/lib/referral-utils";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info including referral details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        referralCode: true,
        referrerId: true,
        referrer: {
          select: {
            username: true,
            email: true,
          },
        },
        referrals: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get stats like total referrals
    const stats = await getUserReferralStats(user.id);

    return NextResponse.json({
      referralCode: user.referralCode,
      referrals: user.referrals,
      referrer: user.referrer,
      stats,
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, referralCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a new referral code if the user doesn't have one
    if (!user.referralCode) {
      const newReferralCode = await generateUniqueReferralCode();

      // Update user with the new referral code
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: newReferralCode },
      });

      return NextResponse.json({ referralCode: newReferralCode });
    }

    // User already has a referral code
    return NextResponse.json({
      referralCode: user.referralCode,
      message: "Referral code already exists",
    });
  } catch (error) {
    console.error("Error generating referral code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
