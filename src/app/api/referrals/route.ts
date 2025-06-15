import { NextRequest, NextResponse } from "next/server";
import {
  generateUniqueReferralCode,
  validateReferralCode,
  applyReferral,
  getUserReferralStats,
} from "@/lib/referral-utils";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

export async function GET(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const walletAddress = session.user.walletAddress;

    // Get user info including referral details
    let user = await prisma.user.findUnique({
      where: { email: walletAddress },
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

    // If user doesn't exist, create a new user
    if (!user) {
      // Generate a unique referral code
      const referralCode = await generateUniqueReferralCode();
      const network = walletAddress.length > 40 ? "solana" : "ethereum";
      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          email: walletAddress,
          walletAddress:
            network === "solana" ? walletAddress : walletAddress.toLowerCase(),
          solanaAddress: network === "solana" ? walletAddress : null,
          evmAddress:
            network === "ethereum" ? walletAddress.toLowerCase() : null,
          walletType: network, // Simple heuristic to determine wallet type
          referralCode: referralCode,
          verified: true,
        },
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

      user = newUser;
      console.log(`Created new user with wallet address: ${walletAddress}`);
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

    if (!session?.user?.walletAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const walletAddress = session.user.walletAddress;

    // Get user
    let user = await prisma.user.findUnique({
      where: { email: walletAddress },
      select: { id: true, referralCode: true },
    });

    // If user doesn't exist, create a new user
    if (!user) {
      // Generate a unique referral code
      const referralCode = await generateUniqueReferralCode();
      const network = walletAddress.length > 40 ? "solana" : "ethereum";
      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          email: walletAddress,
          walletAddress:
            network === "solana" ? walletAddress : walletAddress.toLowerCase(),
          evmAddress:
            network === "ethereum" ? walletAddress.toLowerCase() : null,
          walletType: network, // Simple heuristic to determine wallet type
          referralCode: referralCode,
          verified: true,
        },
        select: {
          id: true,
          referralCode: true,
        },
      });

      user = newUser;
      console.log(
        `Created new user with wallet address: ${walletAddress} and referral code: ${referralCode}`
      );

      return NextResponse.json({
        referralCode: referralCode,
        message: "New user created with referral code",
      });
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
