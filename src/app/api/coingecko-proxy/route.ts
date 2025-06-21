import { NextResponse } from "next/server";
import { ethers } from "ethers";

// ABI for price oracle contracts (simplified version for price fetching)
const oracleABI = [
  "function latestAnswer() view returns (int256)",
  "function decimals() view returns (uint8)",
];

// Oracle contract addresses
const oracles: Record<string, string> = {
  sol: "0x4ffC43a60e009B551865A93d232E33Fce9f01507",
  bnb: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  const vs_currencies = searchParams.get("vs_currencies");
  const cacheBust = searchParams.get("cacheBust");

  if (!ids || !vs_currencies) {
    return NextResponse.json(
      { error: "Missing required query parameters: ids and vs_currencies" },
      { status: 400 }
    );
  }

  // If oracle data is requested and ids are supported by our oracles
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com"
    );
    const oracleData: Record<string, number> = {};

    const idList = ids.split(",");

    for (const id of idList) {
      if (oracles[id.toLowerCase()]) {
        const oracleContract = new ethers.Contract(
          oracles[id.toLowerCase()],
          oracleABI,
          provider
        );
        const price = await oracleContract.latestAnswer();
        const decimals = await oracleContract.decimals();

        // Calculate price in USD (assuming the oracle returns price with decimals)
        const priceInUsd = parseFloat(ethers.formatUnits(price, decimals));

        // Format response similar to CoinGecko
        oracleData[id] = priceInUsd;
      }
    }

    // If we have oracle data for requested IDs, return it
    if (Object.keys(oracleData).length > 0) {
      return NextResponse.json(oracleData);
    }
  } catch (error) {
    console.error("Error fetching from oracle:", error);
    // Fall through to CoinGecko if oracle fails
  }

  // Default to CoinGecko API
  const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}${
    cacheBust ? `&cacheBust=${cacheBust}` : ""
  }`;

  try {
    const response = await fetch(coingeckoUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Coingecko API error:", errorData);
      return NextResponse.json(
        {
          error: `Failed to fetch from Coingecko API: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying Coingecko request:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching from Coingecko" },
      { status: 500 }
    );
  }
}
