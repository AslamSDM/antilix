import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  generateUniqueReferralCode,
  validateReferralCode,
} from "@/lib/referral-utils";

// Validation schema for user registration
const userSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password, referralCode } = userSchema.parse(body);

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "Username already in use" },
          { status: 409 }
        );
      }
    }

    // Check if referral code exists (if provided)
    let referrerId: string | null = null;

    if (referralCode) {
      referrerId = await validateReferralCode(referralCode);

      if (!referrerId) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }
    }

    // Generate a unique referral code for the new user
    const newReferralCode = await generateUniqueReferralCode();

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: password ? password : undefined,
        referralCode: newReferralCode,
        referrerId,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
