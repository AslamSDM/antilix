import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  VersionedTransactionResponse,
  ParsedTransactionWithMeta,
  TransactionResponse,
} from "@solana/web3.js";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Address of the presale master wallet
const MASTER_WALLET_ADDRESS = "F16pJr3MJ7ppC4nd8nxfPrWjfhkGK1qbgmUyMxm3xLoZ";

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
    let isTransferToMasterWallet = false;

    // Handle versioned transactions (newer format)
    if ("version" in transaction && transaction.version !== "legacy") {
      const versionedTx = transaction as VersionedTransactionResponse;

      if (versionedTx.transaction.message.compiledInstructions) {
        isTransferToMasterWallet =
          versionedTx.transaction.message.compiledInstructions.some(
            (instruction) => {
              // Check if it's a system program transfer
              const programId =
                versionedTx.transaction.message.staticAccountKeys[
                  instruction.programIdIndex
                ].toBase58();

              const isSystemProgram =
                programId === "11111111111111111111111111111111";

              if (!isSystemProgram) return false;

              // Get destination account
              const accounts = instruction.accountKeyIndexes.map((index) =>
                versionedTx.transaction.message.staticAccountKeys[
                  index
                ].toBase58()
              );

              return accounts.includes(MASTER_WALLET_ADDRESS);
            }
          );
      }
    } else {
      // Handle legacy transactions (older format)
      const legacyTx = transaction as TransactionResponse;

      if (legacyTx.transaction.message.instructions) {
        isTransferToMasterWallet =
          legacyTx.transaction.message.instructions.some((instruction) => {
            // Check if it's a system program transfer
            const programId =
              legacyTx.transaction.message.accountKeys[
                instruction.programIdIndex
              ].toBase58();

            const isSystemProgram =
              programId === "11111111111111111111111111111111";

            if (!isSystemProgram) return false;

            // Get destination account
            const accounts = instruction.accounts.map((index) =>
              legacyTx.transaction.message.accountKeys[index].toBase58()
            );

            return accounts.includes(MASTER_WALLET_ADDRESS);
          });
      }
    }

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
    if (transaction.meta?.innerInstructions) {
      transaction.meta.innerInstructions.forEach((inner) => {
        inner.instructions.forEach((instruction) => {
          // Type guard for parsed instruction
          if (
            "parsed" in instruction &&
            instruction.parsed &&
            typeof instruction.parsed === "object" &&
            "type" in instruction.parsed &&
            instruction.parsed.type === "transfer" &&
            "info" in instruction.parsed &&
            typeof instruction.parsed.info === "object" &&
            instruction.parsed.info &&
            "lamports" in instruction.parsed.info &&
            typeof instruction.parsed.info.lamports === "number"
          ) {
            transferAmount += instruction.parsed.info.lamports;
          }
        });
      });
    }

    // Also check pre and post balances for amount calculation if inner instructions don't have it
    if (
      transferAmount === 0 &&
      transaction.meta?.preBalances &&
      transaction.meta?.postBalances
    ) {
      // Find the sender's balance change (typically index 0)
      const balanceChange =
        transaction.meta.preBalances[0] - transaction.meta.postBalances[0];
      if (balanceChange > 0) {
        transferAmount = balanceChange;
      }
    }

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

    try {
      // Handle versioned transactions
      if ("version" in transaction && transaction.version !== "legacy") {
        const versionedTx = transaction as VersionedTransactionResponse;

        versionedTx.transaction.message.compiledInstructions?.forEach(
          (instruction) => {
            try {
              const programId =
                versionedTx.transaction.message.staticAccountKeys[
                  instruction.programIdIndex
                ].toBase58();

              if (programId === "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo") {
                // This is a memo instruction, extract the data
                const data = Buffer.from(instruction.data).toString("utf8");
                if (data.startsWith("ref:")) {
                  referralCode = data.substring(4);
                }
              }
            } catch (e) {
              console.error("Error processing versioned instruction:", e);
            }
          }
        );
      } else {
        // Handle legacy transactions
        const legacyTx = transaction as TransactionResponse;

        legacyTx.transaction.message.instructions?.forEach((instruction) => {
          try {
            const programId =
              legacyTx.transaction.message.accountKeys[
                instruction.programIdIndex
              ].toBase58();

            if (programId === "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo") {
              // This is a memo instruction, extract the data
              const data = Buffer.from(instruction.data, "base64").toString(
                "utf8"
              );
              if (data.startsWith("ref:")) {
                referralCode = data.substring(4);
              }
            }
          } catch (e) {
            console.error("Error processing legacy instruction:", e);
          }
        });
      }
    } catch (e) {
      console.error("Error extracting referral code:", e);
    }

    // Get sender address safely based on transaction version
    let senderAddress = "";
    try {
      if ("version" in transaction && transaction.version !== "legacy") {
        const versionedTx = transaction as VersionedTransactionResponse;
        senderAddress =
          versionedTx.transaction.message.staticAccountKeys[0].toBase58();
      } else {
        const legacyTx = transaction as TransactionResponse;
        senderAddress = legacyTx.transaction.message.accountKeys[0].toBase58();
      }
    } catch (e) {
      console.error("Error getting sender address:", e);
      senderAddress = "unknown";
    }

    return NextResponse.json({
      verified: true,
      transaction: {
        signature,
        sender: senderAddress,
        amount: transferAmount / 1_000_000_000, // Convert from lamports to SOL
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
