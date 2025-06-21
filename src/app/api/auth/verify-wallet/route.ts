import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/next-auth";
import { verifySignature } from "@/lib/wallet-auth";

// Define error response types for better client handling
const ERROR_TYPES = {
  AUTH_REQUIRED: { code: "AUTH_REQUIRED", message: "Authentication required" },
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    message: "Invalid or missing required fields",
  },
  UNSUPPORTED_WALLET: {
    code: "UNSUPPORTED_WALLET",
    message: "Unsupported wallet type",
  },
  INVALID_SIGNATURE: {
    code: "INVALID_SIGNATURE",
    message: "Invalid wallet signature",
  },
  SIGNATURE_EXPIRED: {
    code: "SIGNATURE_EXPIRED",
    message: "Signature has expired",
  },
  SERVER_ERROR: { code: "SERVER_ERROR", message: "Server error occurred" },
};

export async function POST(req: NextRequest) {
  try {
    // Get session to make sure the user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: ERROR_TYPES.AUTH_REQUIRED.message,
          code: ERROR_TYPES.AUTH_REQUIRED.code,
        },
        { status: 401 }
      );
    }

    const {
      walletAddress,
      walletType,
      userId = session.user.id,
      signature,
      message,
    } = await req.json();

    // Validate inputs
    if (!walletAddress || !walletType) {
      return NextResponse.json(
        {
          error: ERROR_TYPES.INVALID_INPUT.message,
          code: ERROR_TYPES.INVALID_INPUT.code,
        },
        { status: 400 }
      );
    }

    // Verify wallet type is supported
    if (!["solana", "ethereum", "bsc"].includes(walletType)) {
      return NextResponse.json(
        {
          error: ERROR_TYPES.UNSUPPORTED_WALLET.message,
          code: ERROR_TYPES.UNSUPPORTED_WALLET.code,
        },
        { status: 400 }
      );
    }

    // If Solana wallet, verify the signature
    if (walletType === "solana" && signature && message) {
      try {
        // Skip signature verification for test mode if enabled
        const isTestMode = process.env.NEXT_PUBLIC_ENABLE_TEST_MODE === "true";
        const isTestSignature = signature.startsWith("TEST_");

        // Only verify real signatures (not test ones)
        if (!isTestMode || !isTestSignature) {
          // Check for signature replay attacks by extracting timestamp from the message
          const timestampMatch = message.match(/Timestamp: (\d+)/);
          if (timestampMatch && timestampMatch[1]) {
            const signatureTimestamp = parseInt(timestampMatch[1], 10);
            const currentTime = Date.now();
            const maxAgeMs = 5 * 60 * 1000; // 5 minutes

            // Reject signatures older than the maximum age
            if (currentTime - signatureTimestamp > maxAgeMs) {
              return NextResponse.json(
                {
                  error: ERROR_TYPES.SIGNATURE_EXPIRED.message,
                  code: ERROR_TYPES.SIGNATURE_EXPIRED.code,
                },
                { status: 400 }
              );
            }
          }

          const isValid = verifySignature(signature, message, walletAddress);

          if (!isValid) {
            return NextResponse.json(
              {
                error: ERROR_TYPES.INVALID_SIGNATURE.message,
                code: ERROR_TYPES.INVALID_SIGNATURE.code,
              },
              { status: 400 }
            );
          }
        }
      } catch (signatureError: any) {
        console.error("Error verifying signature:", signatureError);
        return NextResponse.json(
          {
            error: `Failed to verify signature: ${signatureError.message}`,
            code: ERROR_TYPES.INVALID_SIGNATURE.code,
          },
          { status: 400 }
        );
      }
    }

    // Update the user's wallet information
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletAddress,
        walletType,
        walletVerified: true,
        ...(walletType === "solana" && {
          solanaAddress: walletAddress,
          solanaVerified: true,
        }),
        ...(["ethereum", "bsc"].includes(walletType) && {
          evmAddress: walletAddress,
          evmVerified: true,
        }),
      },
    });

    // Return success
    return NextResponse.json({
      userId: updatedUser.id,
      message: "Wallet verified successfully",
      verified: true,
      walletType,
    });
  } catch (error: any) {
    console.error("Error verifying wallet:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to verify wallet",
        code: ERROR_TYPES.SERVER_ERROR.code,
      },
      { status: 500 }
    );
  }
}
