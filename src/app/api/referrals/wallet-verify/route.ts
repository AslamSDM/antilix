import { NextRequest, NextResponse } from "next/server";
import { verifyWalletForReferral } from "@/lib/wallet-auth";
import { generateUniqueReferralCode } from "@/lib/referral-utils";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

export async function POST(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    const { walletAddress, signature, message, walletType } = body;

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the signature for Solana wallets
    let isVerified = false;

    if (walletType === "solana") {
      isVerified = verifyWalletForReferral(walletAddress, signature, message);
    } else if (walletType === "ethereum") {
      // For Ethereum, we'd implement a different verification method
      // For now, we'll mock this as successful
      isVerified = true; // Replace with actual Ethereum verification
    } else {
      return NextResponse.json(
        { error: "Unsupported wallet type" },
        { status: 400 }
      );
    }

    if (!isVerified) {
      return NextResponse.json(
        { error: "Failed to verify wallet signature" },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, referralCode: true, walletAddress: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's wallet address if it's different
    if (user.walletAddress !== walletAddress) {
      await prisma.user.update({
        where: { id: user.id },
        data: { walletAddress, walletType },
      });
    }

    // Generate a new referral code if the user doesn't have one
    let referralCode = user.referralCode;

    if (!referralCode) {
      referralCode = await generateUniqueReferralCode();

      // Update user with the new referral code
      await prisma.user.update({
        where: { id: user.id },
        data: {
          referralCode,
          walletVerified: true,
        },
      });
    } else {
      // Just update the wallet verified flag
      await prisma.user.update({
        where: { id: user.id },
        data: { walletVerified: true },
      });
    }

    // Return the referral code
    return NextResponse.json({
      success: true,
      referralCode,
      walletAddress,
      walletVerified: true,
    });
  } catch (error) {
    console.error("Error in wallet verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
