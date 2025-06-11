import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Address of the presale master wallet
const MASTER_WALLET_ADDRESS = "8FNBidGYxNaPVMDr7BFgbAK7qdYfBxcBvNz1uTosT3cX";

// Validation schema
const verificationSchema = z.object({
  signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { signature } = verificationSchema.parse(body);

    // Connect to Solana
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"
    );

    // Fetch transaction details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if the transaction is a transfer to our master wallet
    const isTransferToMasterWallet =
      transaction.transaction.message.instructions.some((instruction) => {
        // Check if it's a system program transfer
        const programId =
          transaction.transaction.message.accountKeys[
            instruction.programIndex
          ].toBase58();
        const isSystemProgram =
          programId === "11111111111111111111111111111111";

        if (!isSystemProgram) return false;

        // Get destination account
        const accounts = instruction.accounts.map((index) =>
          transaction.transaction.message.accountKeys[index].toBase58()
        );

        return accounts.includes(MASTER_WALLET_ADDRESS);
      });

    if (!isTransferToMasterWallet) {
      return NextResponse.json(
        {
          error:
            "Transaction is not a valid transfer to the presale master wallet",
        },
        { status: 400 }
      );
    }

    // Extract transaction amount
    let transferAmount = 0;
    // Find the transfer instruction and get the amount
    transaction.meta?.innerInstructions?.forEach((inner) => {
      inner.instructions.forEach((instruction) => {
        if (instruction.parsed?.type === "transfer") {
          transferAmount += instruction.parsed.info.lamports;
        }
      });
    });

    // Check if we already have this transaction recorded
    const existingTransaction = await prisma.purchase.findUnique({
      where: { transactionSignature: signature },
    });

    if (existingTransaction) {
      return NextResponse.json(
        {
          error: "Transaction already recorded",
          purchase: existingTransaction,
        },
        { status: 200 }
      );
    }

    // Extract referral code if present (from memo instruction)
    let referralCode = "";
    transaction.transaction.message.instructions.forEach((instruction) => {
      const programId =
        transaction.transaction.message.accountKeys[
          instruction.programIndex
        ].toBase58();
      if (programId === "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo") {
        // This is a memo instruction, extract the data
        const data = Buffer.from(instruction.data, "base64").toString("utf8");
        if (data.startsWith("ref:")) {
          referralCode = data.substring(4);
        }
      }
    });

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        sender: transaction.transaction.message.accountKeys[0].toBase58(),
        amount: transferAmount / 1000000000, // Convert from lamports to SOL
        referralCode,
      },
      // Include purchase data if we found it earlier
      purchase: existingTransaction,
    });
  } catch (error) {
    console.error("Error verifying Solana transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
