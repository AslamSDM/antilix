import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for adding EVM address
const evmAddressSchema = z.object({
  userId: z.string(),
  evmAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address format"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, evmAddress } = evmAddressSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if EVM address is already in use
    const existingAddress = await prisma.user.findUnique({
      where: { evmAddress },
    });

    if (existingAddress) {
      return NextResponse.json(
        { error: "This EVM address is already registered" },
        { status: 400 }
      );
    }

    // Add EVM address to user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { evmAddress },
    });

    return NextResponse.json({
      id: updatedUser.id,
      evmAddress: updatedUser.evmAddress,
    });
  } catch (error) {
    console.error("Add EVM address error:", error);
    return NextResponse.json(
      { error: "Failed to add EVM address" },
      { status: 500 }
    );
  }
}
