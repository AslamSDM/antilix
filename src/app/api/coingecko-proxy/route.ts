import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  const vs_currencies = searchParams.get("vs_currencies");
  const cacheBust = searchParams.get("cacheBust"); // Forward cacheBust for potential debugging or specific API needs

  if (!ids || !vs_currencies) {
    return NextResponse.json(
      { error: "Missing required query parameters: ids and vs_currencies" },
      { status: 400 }
    );
  }

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
