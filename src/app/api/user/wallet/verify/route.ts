import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

// Validation schema for verification request
const verificationRequestSchema = z.object({
  walletId: z.string(),
});

// Validation schema for verification confirmation
const verificationConfirmSchema = z.object({
  token: z.string(),
});

// Create a verification request for a wallet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletId } = verificationRequestSchema.parse(body);

    // Find the wallet
    const wallet = await prisma.wallet.findUnique({
      where: { id: walletId },
      include: { user: true },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Generate a verification token
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create a verification token
    await prisma.verificationToken.create({
      data: {
        token,
        expires,
        userId: wallet.userId,
        type: "WALLET_VERIFICATION",
      },
    });

    // In a real application, you would send this token to the user
    // via the blockchain (e.g., sign a message) or another secure method

    return NextResponse.json({
      message: "Verification token created",
      token, // In production, don't return the token directly
    });
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json(
      { error: "Failed to create verification request" },
      { status: 500 }
    );
  }
}

// Verify a wallet using a token
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verificationConfirmSchema.parse(body);

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Verification token expired" },
        { status: 400 }
      );
    }

    if (verificationToken.type !== "WALLET_VERIFICATION") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Find the wallet associated with this user
    // In a real application, you would verify that the wallet belongs to the user
    // by checking a signature or other proof
    const wallet = await prisma.wallet.findFirst({
      where: { userId: verificationToken.userId },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Mark the wallet as verified
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { verified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      message: "Wallet verified successfully",
      walletId: wallet.id,
    });
  } catch (error) {
    console.error("Verification confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm verification" },
      { status: 500 }
    );
  }
}
