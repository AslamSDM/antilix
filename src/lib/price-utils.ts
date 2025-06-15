import { toast } from "sonner";

/**
 * Fixed USD price for 1 LMX token
 */
export const LMX_PRICE_USD = 0.012;

/**
 * Fallback prices in case API request fails
 */
const FALLBACK_PRICES = {
  bnb: 430, // Default fallback price for BNB in USD
  sol: 175, // Default fallback price for SOL in USD
};

/**
 * Interface for cryptocurrency price data
 */
interface CryptoPrices {
  bnb: number; // BNB price in USD
  sol: number; // SOL price in USD
}

/**
 * Cache for cryptocurrency prices to reduce API calls
 */
let priceCache: CryptoPrices | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch current cryptocurrency prices from Coingecko API
 * @param forceRefresh Whether to bypass the cache and force a fresh API call
 */
export async function fetchCryptoPrices(
  forceRefresh: boolean = false
): Promise<CryptoPrices> {
  const now = Date.now();

  // Return in-memory cached prices if they're still valid
  if (!forceRefresh && priceCache && now - lastFetchTime < CACHE_DURATION) {
    return priceCache;
  }

  // Try to get from localStorage if available and not forcing refresh
  if (!forceRefresh) {
    const storedPrices = getCachedPrices();
    if (storedPrices) {
      // Update the in-memory cache as well
      priceCache = storedPrices;
      lastFetchTime = now;
      return storedPrices;
    }
  }

  try {
    // Add a cache-busting parameter to prevent caching by the browser or CDN
    const cacheBuster = `cacheBust=${Date.now()}`;
    const response = await fetch(
      `/api/coingecko-proxy?ids=binancecoin,solana&vs_currencies=usd&${cacheBuster}`,
      {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        // Include credentials for potential API rate limiting identification
        credentials: "omit",
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching prices: ${response.status}`);
    }

    const data = await response.json();

    const prices: CryptoPrices = {
      bnb: data.binancecoin.usd,
      sol: data.solana.usd,
    };

    // Update in-memory cache
    priceCache = prices;
    lastFetchTime = now;

    // Also persist to localStorage
    savePricesToStorage(prices);

    return prices;
  } catch (error) {
    console.error("Failed to fetch crypto prices:", error);

    // Return fallback prices on error
    return FALLBACK_PRICES;
  }
}

/**
 * Calculate how many tokens can be bought with a specific amount of cryptocurrency
 * @param cryptoAmount Amount of cryptocurrency (BNB or SOL)
 * @param cryptoType Type of cryptocurrency ('bnb' or 'sol')
 * @param prices Current prices of cryptocurrencies
 */
export function calculateTokenAmount(
  cryptoAmount: number,
  cryptoType: "bnb" | "sol",
  prices: CryptoPrices
): number {
  if (cryptoAmount <= 0) return 0;

  const cryptoPrice = cryptoType === "bnb" ? prices.bnb : prices.sol;
  const usdValue = cryptoAmount * cryptoPrice;
  return usdValue / LMX_PRICE_USD;
}

/**
 * Calculate how much cryptocurrency is needed to buy a specific amount of tokens
 * @param tokenAmount Amount of LMX tokens
 * @param cryptoType Type of cryptocurrency ('bnb' or 'sol')
 * @param prices Current prices of cryptocurrencies
 */
export function calculateCryptoCost(
  tokenAmount: number,
  cryptoType: "bnb" | "sol",
  prices: CryptoPrices
): number {
  if (tokenAmount <= 0) return 0;

  const usdCost = tokenAmount * LMX_PRICE_USD;
  const cryptoPrice = cryptoType === "bnb" ? prices.bnb : prices.sol;
  return usdCost / cryptoPrice;
}

/**
 * Calculate USD value of a cryptocurrency amount
 * @param cryptoAmount Amount of cryptocurrency (BNB or SOL)
 * @param cryptoType Type of cryptocurrency ('bnb' or 'sol')
 * @param prices Current prices of cryptocurrencies
 */
export function calculateUsdValue(
  cryptoAmount: number,
  cryptoType: "bnb" | "sol",
  prices: CryptoPrices
): number {
  if (cryptoAmount <= 0) return 0;
  const cryptoPrice = cryptoType === "bnb" ? prices.bnb : prices.sol;
  return cryptoAmount * cryptoPrice;
}

/**
 * Format a crypto amount with appropriate precision
 * @param amount Amount of cryptocurrency
 * @param cryptoType Type of cryptocurrency ('bnb' or 'sol')
 */
export function formatCryptoAmount(
  amount: number,
  cryptoType: "bnb" | "sol"
): string {
  // BNB typically uses 8 decimal places, SOL uses 9
  const decimals = cryptoType === "bnb" ? 8 : 9;
  return amount.toFixed(decimals);
}

/**
 * Persist prices to localStorage to reduce API calls on page reloads
 * @param prices Current cryptocurrency prices
 */
export function savePricesToStorage(prices: CryptoPrices): void {
  try {
    localStorage.setItem(
      "lmx-crypto-prices",
      JSON.stringify({
        prices,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.warn("Failed to save prices to localStorage:", error);
  }
}

/**
 * Get cached prices from localStorage if they are still valid
 */
export function getCachedPrices(): CryptoPrices | null {
  try {
    const cached = localStorage.getItem("lmx-crypto-prices");
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    // Return if cache is still valid (less than CACHE_DURATION old)
    if (now - data.timestamp < CACHE_DURATION) {
      return data.prices;
    }
  } catch (error) {
    console.warn("Failed to retrieve cached prices:", error);
  }
  return null;
}

/**
 * Format a USD value with appropriate precision
 * @param amount USD amount to format
 * @param minimumFractionDigits Minimum fraction digits (default: 2)
 * @param maximumFractionDigits Maximum fraction digits (default: 4)
 */
export function formatUsdValue(
  amount: number,
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 4
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Get timestamp of the last price update
 * @returns Date object of last price update, or null if no prices cached
 */
export function getLastPriceUpdateTime(): Date | null {
  try {
    const cached = localStorage.getItem("lmx-crypto-prices");
    if (!cached) return null;

    const data = JSON.parse(cached);
    return new Date(data.timestamp);
  } catch (error) {
    return null;
  }
}
export async function getTokenDetails(address?: string) {
  try {
    if (!address) {
      return undefined;
    }
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`
    );
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data?.pairs[0];
  } catch (error) {
    console.error("Error fetching token details:", error);
  }
}
