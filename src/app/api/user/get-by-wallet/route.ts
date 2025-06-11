import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const userByWalletSchema = z.object({
  address: z.string(),
  walletType: z.enum(["ethereum", "solana"]),
});

/**
 * API endpoint to get user by their wallet address
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, walletType } = userByWalletSchema.parse(body);

    // Determine which wallet field to query
    const walletField =
      walletType === "solana" ? "solanaAddress" : "evmAddress";

    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        [walletField]: address,
      },
      select: {
        id: true,
        username: true,
        email: true,
        walletAddress: true,
        solanaAddress: true,
        evmAddress: true,
        referralCode: true,
        walletType: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error getting user by wallet:", error);
    return NextResponse.json(
      { error: "Failed to get user by wallet" },
      { status: 500 }
    );
  }
}
