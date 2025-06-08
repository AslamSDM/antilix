import { useState, useEffect, useCallback } from "react";
import { Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEthereumWallet } from "@/components/providers/wallet-provider";
import { bscPresale, solanaPresale } from "@/lib/presale-contract";
import { toast } from "sonner";

interface PresaleStatus {
  isActive: boolean;
  hardCap: string;
  minPurchase: string;
  maxPurchase: string;
  tokenPrice: string;
  soldTokens: string;
  totalRaised: string;
  percentageSold: number;
}

export default function usePresale() {
  // Wallet states
  const {
    publicKey,
    connected: solanaConnected,
    sendTransaction,
  } = useWallet();
  const { address: ethAddress, isConnected: ethConnected } =
    useEthereumWallet();

  // Presale states
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [presaleNetwork, setPresaleNetwork] = useState<"bsc" | "solana" | null>(
    null
  );
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [bscStatus, setBscStatus] = useState<PresaleStatus | null>(null);
  const [solanaStatus, setSolanaStatus] = useState<PresaleStatus | null>(null);
  const [userPurchasedTokens, setUserPurchasedTokens] = useState("0");

  // Current active status based on selected network
  const presaleStatus = presaleNetwork === "bsc" ? bscStatus : solanaStatus;

  // Check if user has a connected wallet for the selected network
  const hasConnectedWallet =
    (presaleNetwork === "bsc" && ethConnected) ||
    (presaleNetwork === "solana" && solanaConnected);

  // Additional connection status tracking for each network individually
  const hasBscWalletConnected = ethConnected;
  const hasSolanaWalletConnected = solanaConnected;

  // Set a default network if none is selected yet
  useEffect(() => {
    // If no network is selected, default to BSC so users can at least see the form
    if (!presaleNetwork) {
      setPresaleNetwork("bsc");
    }
  }, [presaleNetwork]);

  // Load BSC presale status
  const loadBscPresaleStatus = useCallback(async () => {
    const status = await bscPresale.getPresaleStatus();
    if (status) {
      setBscStatus(status);
    }
  }, []);

  // Load Solana presale status
  const loadSolanaPresaleStatus = useCallback(async () => {
    // Allow loading Solana presale data even without a connected wallet
    try {
      // Create a Solana connection (using devnet for testing)
      const connection = new Connection("https://api.devnet.solana.com");
      const status = await solanaPresale.getPresaleStatus(connection);
      if (status) {
        setSolanaStatus(status);
      }
    } catch (error) {
      console.error("Error loading Solana presale status:", error);
      toast.error("Failed to load Solana presale data");
    }
  }, []);

  // Load user's purchased tokens
  const loadUserPurchasedTokens = useCallback(async () => {
    if (ethConnected && ethAddress) {
      const tokens = await bscPresale.getUserPurchasedTokens(ethAddress);
      setUserPurchasedTokens(tokens);
    }
  }, [ethConnected, ethAddress]);

  // Load presale data when component mounts or wallet connection changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // Always load BSC data regardless of wallet connection
        console.log("Loading BSC presale status...");
        await loadBscPresaleStatus();

        // Always attempt to load Solana data as well
        console.log("Loading Solana presale status...");
        await loadSolanaPresaleStatus();

        // Load user data if applicable wallets are connected
        if (ethConnected) {
          await loadUserPurchasedTokens();
        }
      } catch (error) {
        console.error("Error loading presale data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    solanaConnected,
    ethConnected,
    loadBscPresaleStatus,
    loadSolanaPresaleStatus,
    loadUserPurchasedTokens,
  ]);

  // Buy tokens based on selected network
  const buyTokens = async (amount: number, referrer?: string) => {
    if (isBuying) return;
    if (!presaleNetwork) {
      toast.error("Please select a network first");
      return;
    }

    setIsBuying(true);

    try {
      let success = false;

      if (presaleNetwork === "bsc") {
        if (!ethConnected) {
          toast.error("Ethereum wallet not connected");
          return;
        }
        success = await bscPresale.buyTokens(amount, referrer);
      } else if (presaleNetwork === "solana") {
        if (!solanaConnected || !publicKey) {
          toast.error("Solana wallet not connected");
          return;
        }

        const connection = new Connection("https://api.devnet.solana.com");
        const amountInSol =
          amount * parseFloat(solanaStatus?.tokenPrice || "0.001");
        success = await solanaPresale.buyTokens(
          connection,
          { publicKey, sendTransaction },
          amountInSol,
          referrer
        );
      }

      if (success) {
        // Reload data after successful purchase
        if (presaleNetwork === "bsc") {
          await loadBscPresaleStatus();
          await loadUserPurchasedTokens();
        } else if (presaleNetwork === "solana") {
          await loadSolanaPresaleStatus();
        }
      }
    } catch (error: any) {
      console.error("Error buying tokens:", error);
      toast.error(error.message || "Failed to purchase tokens");
    } finally {
      setIsBuying(false);
    }
  };

  // Switch presale network
  const switchNetwork = (network: "bsc" | "solana") => {
    // Allow switching between networks even if the wallet is not connected
    // Just show a toast suggesting wallet connection if not already connected
    if (
      (network === "bsc" && !ethConnected) ||
      (network === "solana" && !solanaConnected)
    ) {
      toast.info(
        `Consider connecting your ${
          network === "bsc" ? "Ethereum" : "Solana"
        } wallet to enable buying tokens`
      );
    }

    setPresaleNetwork(network);
  };

  return {
    isLoading,
    isBuying,
    presaleNetwork,
    presaleStatus,
    bscStatus,
    solanaStatus,
    tokenAmount,
    userPurchasedTokens,
    hasConnectedWallet,
    hasBscWalletConnected,
    hasSolanaWalletConnected,
    setTokenAmount,
    buyTokens,
    switchNetwork,
    refreshData: async () => {
      await Promise.all([
        loadBscPresaleStatus(),
        loadSolanaPresaleStatus(),
        loadUserPurchasedTokens(),
      ]);
    },
  };
}
