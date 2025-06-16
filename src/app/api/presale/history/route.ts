import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get wallet address from query param only
    const address = req.nextUrl.searchParams.get("walletAddress");
    const walletAddress = address?.startsWith("0x")
      ? address.toLowerCase()
      : address;

    console.log("Fetching purchase history for wallet:", walletAddress);
    if (!walletAddress) {
      return NextResponse.json(
        { error: "No wallet address provided in query parameters" },
        { status: 400 }
      );
    }

    // Find user by their wallet address
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress },
          { solanaAddress: walletAddress },
          { evmAddress: walletAddress },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ purchases: [] }, { status: 200 });
    }

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        lmxTokensAllocated: true,
        status: true,
        network: true,
        transactionSignature: true,
      },
    });

    return NextResponse.json({
      purchases: purchases || [],
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase history" },
      { status: 500 }
    );
  }
}
