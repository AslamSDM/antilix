import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for adding Solana address
const solanaAddressSchema = z.object({
  userId: z.string(),
  solanaAddress: z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, solanaAddress } = solanaAddressSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if Solana address is already in use
    const existingAddress = await prisma.user.findUnique({
      where: { solanaAddress },
    });

    if (existingAddress) {
      return NextResponse.json(
        { error: "This Solana address is already registered" },
        { status: 400 }
      );
    }

    // Add Solana address to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { solanaAddress },
    });

    return NextResponse.json({
      id: updatedUser.id,
      solanaAddress: updatedUser.solanaAddress,
    });
  } catch (error) {
    console.error("Add Solana address error:", error);
    return NextResponse.json(
      { error: "Failed to add Solana address" },
      { status: 500 }
    );
  }
}
