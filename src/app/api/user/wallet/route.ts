import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for wallet addition
const walletSchema = z.object({
  userId: z.string(),
  address: z.string(),
  type: z.enum(["EVM", "SOLANA"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, address, type } = walletSchema.parse(body);

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if wallet address already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { address },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet address already registered" },
        { status: 400 }
      );
    }

    // Add the wallet to the user
    const wallet = await prisma.wallet.create({
      data: {
        address,
        type,
        userId,
      },
    });

    return NextResponse.json({
      id: wallet.id,
      address: wallet.address,
      type: wallet.type,
    });
  } catch (error) {
    console.error("Add wallet error:", error);
    return NextResponse.json(
      { error: "Failed to add wallet" },
      { status: 500 }
    );
  }
}

// Get all wallets for a user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get all wallets for the user
    const wallets = await prisma.wallet.findMany({
      where: { userId },
    });

    return NextResponse.json(wallets);
  } catch (error) {
    console.error("Get wallets error:", error);
    return NextResponse.json(
      { error: "Failed to get wallets" },
      { status: 500 }
    );
  }
}
