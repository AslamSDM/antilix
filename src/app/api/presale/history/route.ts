import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get wallet address from session or query param
    const walletAddress =
      session?.user?.walletAddress ||
      req.nextUrl.searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "No wallet address provided" },
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

    // Get purchases for this user
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      purchases,
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase history" },
      { status: 500 }
    );
  }
}
