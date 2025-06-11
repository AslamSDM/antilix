import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const referralApplicationSchema = z.object({
  walletAddress: z.string(),
  referralCode: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, referralCode } =
      referralApplicationSchema.parse(body);

    // Find the referrer by their referral code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Find the user by their wallet address
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress },
          { solanaAddress: walletAddress },
          { evmAddress: walletAddress },
        ],
      },
    });

    // If no user exists, create a new one
    if (!user) {
      // Determine if this is a Solana or EVM address (simple heuristic)
      const isSolana = walletAddress.length > 40;

      // Generate a new referral code for this user
      const newReferralCode = `LMX${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;

      // Create the user with appropriate wallet address fields
      user = await prisma.user.create({
        data: {
          walletAddress,
          walletType: isSolana ? "solana" : "ethereum",
          ...(isSolana
            ? { solanaAddress: walletAddress }
            : { evmAddress: walletAddress }),
          referralCode: newReferralCode,
          referrerId: referrer.id, // Set the referrer
        },
      });

      return NextResponse.json({
        success: true,
        message: "New user created and referral applied",
        user: {
          id: user.id,
          referralCode: user.referralCode,
        },
      });
    }

    // If user already has a referrer, don't override it
    if (user.referrerId) {
      // Check if the referrer is the same
      if (user.referrerId === referrer.id) {
        return NextResponse.json({
          success: true,
          message: "User already has this referrer",
        });
      }

      return NextResponse.json(
        {
          error: "User already has a referrer",
          alreadyApplied: true,
        },
        { status: 409 } // Conflict
      );
    }

    // Update the user with the referrer ID
    await prisma.user.update({
      where: { id: user.id },
      data: { referrerId: referrer.id },
    });

    return NextResponse.json({
      success: true,
      message: "Referral applied successfully",
    });
  } catch (error) {
    console.error("Error applying referral:", error);
    return NextResponse.json(
      { error: "Failed to apply referral" },
      { status: 500 }
    );
  }
}
