import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { randomUUID } from "crypto";

// Validation schema for email verification request
const emailVerificationRequestSchema = z.object({
  email: z.string().email(),
});

// Validation schema for email verification confirmation
const emailVerificationConfirmSchema = z.object({
  token: z.string(),
});

// Request email verification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = emailVerificationRequestSchema.parse(body);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
        type: "EMAIL_VERIFICATION",
      },
    });

    // In a real application, you would send the verification link via email
    // For testing, we'll return the token

    return NextResponse.json({
      message: "Verification email sent",
      token, // In production, don't return the token directly
    });
  } catch (error) {
    console.error("Email verification request error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

// Confirm email verification
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = emailVerificationConfirmSchema.parse(body);

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

    if (verificationToken.type !== "EMAIL_VERIFICATION") {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Mark the user as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { verified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return NextResponse.json({
      message: "Email verified successfully",
      userId: verificationToken.userId,
    });
  } catch (error) {
    console.error("Email verification confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to confirm email verification" },
      { status: 500 }
    );
  }
}
