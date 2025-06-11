import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get wallet address from query param only
    const walletAddress = req.nextUrl.searchParams.get("walletAddress");

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

    // Get purchases directly rather than through relation
    const purchases = await prisma.$queryRaw`
      SELECT * FROM "Purchase"
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;

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
