import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { ethers } from "ethers";
import { presaleAbi } from "@/lib/abi";
import { LMX_PRICE_USD } from "@/lib/price-utils";
import { formatEther } from "viem";

import { sendReferralTokens } from "@/lib/send-referral";
import { BSC_PRESALE_CONTRACT_ADDRESS } from "@/lib/constants";

// Validation schema
const verificationSchema = z.object({
  hash: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hash } = verificationSchema.parse(body);

    // Determine if we're on testnet or mainnet
    const isTestnet = process.env.NEXT_PUBLIC_BSC_TESTNET === "true";

    // Connect to BSC
    const rpcUrl = isTestnet
      ? "https://data-seed-prebsc-1-s1.binance.org:8545/" // BSC Testnet
      : "https://bsc-dataseed.binance.org/"; // BSC Mainnet

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(hash);

    if (!receipt) {
      return NextResponse.json(
        { error: "Transaction not found or not yet confirmed" },
        { status: 404 }
      );
    }

    // Verify transaction status
    if (receipt.status === 0) {
      return NextResponse.json(
        { error: "Transaction failed on the blockchain" },
        { status: 400 }
      );
    }

    // Verify this is a transaction to our presale contract
    console.log(
      receipt.to?.toLowerCase(),
      BSC_PRESALE_CONTRACT_ADDRESS.toLowerCase()
    );
    if (
      receipt.to?.toLowerCase() !== BSC_PRESALE_CONTRACT_ADDRESS.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Transaction is not to the presale contract" },
        { status: 400 }
      );
    }

    // Check if we already have this transaction recorded
    const existingTransaction = await prisma.purchase.findUnique({
      where: { transactionSignature: hash },
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

    // Get transaction details
    const transaction = await provider.getTransaction(hash);

    if (!transaction) {
      return NextResponse.json(
        { error: "Could not fetch complete transaction details" },
        { status: 500 }
      );
    }

    // Create contract interface to decode input data
    const contractInterface = new ethers.Interface(presaleAbi);

    // Try to decode transaction input
    let decodedData;
    try {
      decodedData = contractInterface.parseTransaction({
        data: transaction.data,
      });
    } catch (error) {
      console.error("Error decoding transaction data:", error);
      return NextResponse.json(
        { error: "Could not decode transaction data" },
        { status: 400 }
      );
    }

    // Check if this is a buyTokens function call
    if (decodedData?.name !== "buyTokens") {
      return NextResponse.json(
        { error: "Transaction is not a token purchase" },
        { status: 400 }
      );
    }

    // Extract token amount from function arguments
    const tokenAmount = Number(decodedData.args[0]);
    const valueInWei = transaction.value.toString();
    const valueInBnb = ethers.formatEther(valueInWei);

    let user = await prisma.user.findFirst({
      where: {
        evmAddress: transaction.from.toLowerCase(),
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          evmAddress: transaction.from.toLowerCase(),
          walletAddress: transaction.from.toLowerCase(),
          referralCode: `LMX${Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase()}`,
        },
      });
    }
    if (user.referrerId) {
      const referrer = await prisma.user.findUnique({
        where: { id: user.referrerId },
      });
      if (referrer?.solanaAddress) {
        await sendReferralTokens(referrer.solanaAddress, tokenAmount, "bsc");
      }
    }
    // Create a new purchase record
    const newPurchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        transactionSignature: hash,
        paymentAmount: valueInBnb, // Store as wei
        lmxTokensAllocated: formatEther(BigInt(tokenAmount)),
        pricePerLmxInUsdt: LMX_PRICE_USD, // Set to 0 for now, update later if needed
        network: "BSC",
        status: "COMPLETED",
        paymentCurrency: "BNB", // Adding the required paymentCurrency field
      },
    });

    return NextResponse.json({
      verified: true,
      transaction: {
        hash,
        sender: transaction.from,
        amount: valueInBnb, // BNB amount
        tokenAmount: tokenAmount, // LMX token amount
        blockNumber: receipt.blockNumber,
        gasFee: ethers.formatEther(transaction.gasPrice * receipt.gasUsed),
      },
      // Include purchase data if we found it earlier
      purchase: existingTransaction,
    });
  } catch (error) {
    console.error("Error verifying BSC transaction:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
