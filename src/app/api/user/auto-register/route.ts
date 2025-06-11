import { NextRequest, NextResponse } from "next/server";
import { autoRegisterUser } from "@/lib/auto-register";
import { MergedUserResult } from "@/lib/merge-accounts";
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

    // Auto-register the user - this now includes account merging functionality
    const result = await autoRegisterUser(address, walletType);

    // If result is a string, it's just a userId (no merge happened)
    // If result is an object with an id property, accounts were merged
    const userId = typeof result === "string" ? result : result.id;

    if (!userId) {
      throw new Error("Failed to get valid user ID from registration process");
    }

    // Prepare response data
    const responseData: any = {
      success: true,
      userId,
    };

    // If we received an object with merge info, include it in the response
    if (typeof result === "object" && result.mergeInfo?.wasMerged) {
      responseData.accountsMerged = true;
      responseData.mergeInfo = result.mergeInfo;
    }

    // Set cookie with user ID
    const response = NextResponse.json(responseData);

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
      { error: "Failed to register user", message: (error as Error).message },
      { status: 500 }
    );
  }
}
