import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

// Validation schema for EVM verification request
const evmVerificationRequestSchema = z.object({
  userId: z.string(),
});

// Validation schema for EVM verification confirmation
const evmVerificationConfirmSchema = z.object({
  token: z.string(),
});

// Request EVM verification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = evmVerificationRequestSchema.parse(body);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.evmAddress) {
      return NextResponse.json(
        { error: "User has no EVM address registered" },
        { status: 400 }
      );
    }

    // Generate a verification token
    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create a verification token
    await prisma.verificationToken.create({
      data: {
        token,
        expires,
        userId: user.id,
        type: "EVM_VERIFICATION",
      },
    });

    // In a real application, you would implement blockchain verification
    // For now, return the token for testing
    return NextResponse.json({
      message: "EVM verification initiated",
      token, // In production, don't return the token directly
    });
  } catch (error) {
    console.error("EVM verification request error:", error);
    return NextResponse.json(
      { error: "Failed to initiate EVM verification" },
      { status: 500 }
    );
  }
}

// Confirm EVM verification
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = evmVerificationConfirmSchema.parse(body);

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
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

    if (verificationToken.type !== "EVM_VERIFICATION") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Mark the EVM address as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { evmVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      message: "EVM address verified successfully",
      userId: verificationToken.userId,
    });
  } catch (error) {
    console.error("EVM verification confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm EVM verification" },
      { status: 500 }
    );
  }
}
