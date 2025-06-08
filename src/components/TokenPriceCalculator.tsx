import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RotateCcw, ArrowDownUp, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  fetchCryptoPrices,
  calculateCryptoCost,
  calculateTokenAmount,
  LMX_PRICE_USD,
} from "@/lib/price-utils";

/**
 * TokenPriceCalculator component
 * Allows users to convert between LMX tokens and cryptocurrencies
 * with real-time price data
 */
const TokenPriceCalculator: React.FC<{ className?: string }> = ({
  className,
}) => {
  // Input states
  const [inputAmount, setInputAmount] = useState<string>("100");
  const [outputAmount, setOutputAmount] = useState<string>("0");
  const [inputType, setInputType] = useState<"lmx" | "crypto">("lmx");
  const [cryptoType, setCryptoType] = useState<"bnb" | "sol">("bnb");

  // Price data states
  const [cryptoPrices, setCryptoPrices] = useState<{
    bnb: number;
    sol: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load prices on mount
  useEffect(() => {
    loadPrices();
  }, []);

  // Update conversion when inputs change
  useEffect(() => {
    calculateConversion();
  }, [inputAmount, inputType, cryptoType, cryptoPrices]);

  // Load cryptocurrency prices from API
  const loadPrices = async () => {
    setIsLoading(true);
    try {
      const prices = await fetchCryptoPrices();
      setCryptoPrices(prices);
      setLastUpdated(new Date());
      calculateConversion();

      // Save the latest prices to sessionStorage for recovery in case of network issues
      try {
        sessionStorage.setItem(
          "cached-crypto-prices",
          JSON.stringify({
            prices,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Failed to cache prices:", e);
      }
    } catch (error) {
      console.error("Failed to fetch prices:", error);

      // Try to recover from sessionStorage if API fails
      try {
        const cachedData = sessionStorage.getItem("cached-crypto-prices");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          // Only use cache if it's less than 1 hour old
          if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
            setCryptoPrices(parsed.prices);
            setLastUpdated(new Date(parsed.timestamp));
            calculateConversion();
            toast.warning("Using cached prices due to network error");
          } else {
            toast.error("Cached prices are too old. Using fallback values.");
          }
        } else {
          toast.error("Failed to fetch current prices. Using fallback values.");
        }
      } catch (e) {
        console.error("Failed to recover cached prices:", e);
        toast.error("Failed to fetch current prices. Using fallback values.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate conversion between LMX and cryptocurrency
  const calculateConversion = () => {
    if (!cryptoPrices) return;

    const amount = parseFloat(inputAmount);
    if (isNaN(amount)) {
      setOutputAmount("0");
      return;
    }

    if (inputType === "lmx") {
      // Convert LMX to crypto
      const cryptoAmount = calculateCryptoCost(
        amount,
        cryptoType,
        cryptoPrices
      );
      setOutputAmount(cryptoAmount.toFixed(8));
    } else {
      // Convert crypto to LMX
      const tokenAmount = calculateTokenAmount(
        amount,
        cryptoType,
        cryptoPrices
      );
      setOutputAmount(Math.floor(tokenAmount).toString()); // Round down to whole tokens
    }
  };

  // Toggle between LMX → crypto and crypto → LMX
  const swapDirection = () => {
    // Save current values
    const currentInput = inputAmount;
    const currentOutput = outputAmount;

    // Swap values and direction
    setInputAmount(currentOutput);
    setOutputAmount(currentInput);
    setInputType(inputType === "lmx" ? "crypto" : "lmx");
  };

  return (
    <Card
      className={`border border-primary/20 bg-black/50 backdrop-blur-md ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-primary">LMX Price Calculator</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadPrices}
            disabled={isLoading}
            className="h-8 w-8 rounded-full"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Current price display */}
        <div className="mb-6 p-3 bg-black/40 rounded border border-primary/5 text-center">
          <div className="text-sm text-white/70 mb-1">
            1 LMX token = ${LMX_PRICE_USD.toFixed(4)} USD
          </div>
          {cryptoPrices && (
            <div className="flex justify-between text-xs mt-2 text-white/60">
              <div>
                1 BNB = {(cryptoPrices.bnb / LMX_PRICE_USD).toFixed(0)} LMX
              </div>
              <div>
                1 SOL = {(cryptoPrices.sol / LMX_PRICE_USD).toFixed(0)} LMX
              </div>
            </div>
          )}
          {lastUpdated && (
            <div className="text-xs text-white/40 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Input section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="inputAmount">
              {inputType === "lmx"
                ? "LMX Amount"
                : `${cryptoType.toUpperCase()} Amount`}
            </Label>
            <Input
              id="inputAmount"
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="bg-black/30 border-primary/10 mt-1"
              placeholder="Enter amount"
              min="0"
              step={inputType === "lmx" ? "1" : "0.00000001"}
            />
          </div>

          {/* Swap direction button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapDirection}
              className="rounded-full h-8 w-8 bg-primary/10 hover:bg-primary/20 border-primary/30"
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* Output section */}
          <div>
            <div className="flex justify-between">
              <Label htmlFor="outputAmount">
                {inputType === "lmx"
                  ? `${cryptoType.toUpperCase()} Amount`
                  : "LMX Amount"}
              </Label>

              {/* Only show crypto selector when converting from LMX to crypto */}
              {inputType === "lmx" && (
                <Select
                  value={cryptoType}
                  onValueChange={(value: "bnb" | "sol") => setCryptoType(value)}
                >
                  <SelectTrigger className="w-24 h-8 text-xs bg-black/20">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-primary/20">
                    <SelectItem value="bnb">BNB</SelectItem>
                    <SelectItem value="sol">SOL</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <Input
              id="outputAmount"
              readOnly
              value={outputAmount}
              className="bg-black/50 border-primary/10 mt-1"
            />
          </div>

          {/* USD value */}
          <div className="text-center text-white/70 text-sm p-2 bg-black/20 rounded">
            ≈ $
            {isLoading
              ? "Loading..."
              : inputType === "lmx"
              ? (parseFloat(inputAmount || "0") * LMX_PRICE_USD).toFixed(2)
              : (
                  parseFloat(inputAmount || "0") *
                  (cryptoPrices?.[cryptoType] || 0)
                ).toFixed(2)}{" "}
            USD
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenPriceCalculator;
