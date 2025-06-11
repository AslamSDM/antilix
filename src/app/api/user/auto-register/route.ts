import { NextRequest, NextResponse } from "next/server";
import { autoRegisterUser } from "@/lib/auto-register";
import { getCookie } from "@/lib/cookies";
import { z } from "zod";

// Validation schema for auto-registration
const autoRegisterSchema = z.object({
  address: z.string().min(1),
  walletType: z.enum(["ethereum", "solana"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, walletType } = autoRegisterSchema.parse(body);

    // Auto-register the user
    const userId = await autoRegisterUser(address, walletType);

    // Set cookie with user ID
    const response = NextResponse.json({
      success: true,
      userId,
    });

    // Set cookie to expire in 30 days
    response.cookies.set({
      name: "userId",
      value: userId,
      path: "/",
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return response;
  } catch (error) {
    console.error("Auto-registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
