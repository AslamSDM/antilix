import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { solanaPresale } from "@/lib/presale-contract";

export async function GET(req: NextRequest) {
  try {
    // Get wallet address from query param
    const address = req.nextUrl.searchParams.get("walletAddress");
    const walletAddress = address?.startsWith("0x")
      ? address.toLowerCase()
      : address;

    console.log("Fetching user balance for wallet:", walletAddress);

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
      return NextResponse.json(
        {
          dbBalance: 0,
          contractBalance: 0,
          effectiveBalance: 0,
        },
        { status: 200 }
      );
    }

    // Get purchases from database
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    });

    // Calculate total tokens purchased from database
    const dbBalance = purchases.reduce((total, purchase) => {
      return total + Number(purchase.lmxTokensAllocated);
    }, 0);

    // Return a placeholder for contract balance as it needs to be fetched client-side
    // due to the need for wallet connection to interact with blockchain

    return NextResponse.json({
      dbBalance,
      // Contract balance will be fetched client-side
      contractBalance: null,
      effectiveBalance: dbBalance, // Will be compared with contract balance on client-side
    });
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return NextResponse.json(
      { error: "Failed to fetch user balance" },
      { status: 500 }
    );
  }
}
