import { useState, useEffect, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  type SendOptions,
} from "@solana/web3.js";
import { useAppKitState } from "@reown/appkit/react";
import { modal } from "@/components/providers/wallet-provider";
import { bscPresale, solanaPresale } from "@/lib/presale-contract";
import { toast } from "sonner";
import {
  fetchCryptoPrices,
  calculateCryptoCost,
  calculateTokenAmount,
  LMX_PRICE_USD,
} from "@/lib/price-utils";

// Define an explicit shape for appKitState to resolve type discrepancies
export interface AppKitStateShape {
  // Fields TS currently infers for appKitState in usePresale.ts
  initialized: boolean;
  loading: boolean;
  open: boolean;
  selectedNetworkId?:
    | `solana:${string}`
    | `solana:${number}`
    | `eip155:${string}`
    | `eip155:${number}`
    | `polkadot:${string}`
    | `polkadot:${number}`
    | `bip122:${string}`
    | `bip122:${number}`
    | `cosmos:${string}`
    | `cosmos:${number}`
    | undefined;
  activeChain?: any; // Keep 'any' for now if its internal structure isn't the primary issue

  // Fields successfully used in WalletConnectButton.tsx and needed here
  account?: { address?: string };
  connected?: boolean;
  connector?: { id: string; name?: string; provider?: any };
  chainId?: string | number;
}

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

type WalletType = "bsc" | "solana" | null;

// Updated to use the explicit AppKitStateShape
export function getWalletTypeFromAppKitState(
  appKitState: AppKitStateShape
): WalletType {
  const { connected, chainId, connector } = appKitState;

  if (!connected || !connector || typeof connector.id !== "string") {
    // Guard for connector.id being a string
    return null;
  }

  // Check connector ID for Solana
  if (connector.id.includes("solana")) {
    return "solana";
  }

  // Check chainId for EVM/BSC networks
  if (typeof chainId === "number" && (chainId === 56 || chainId === 97)) {
    return "bsc";
  }

  // Fallback to connector ID or name for EVM/BSC
  if (
    connector.id.includes("metaMask") ||
    connector.id.includes("walletConnect") || // connector.id is now guaranteed to be a string here
    (connector.name &&
      typeof connector.name === "string" &&
      connector.name.toLowerCase().includes("metamask")) ||
    (connector.name &&
      typeof connector.name === "string" &&
      connector.name.toLowerCase().includes("walletconnect"))
  ) {
    return "bsc";
  }

  return null;
}

export default function usePresale() {
  // Cast to the explicit shape
  const appKitState = useAppKitState() as AppKitStateShape;

  // Access properties directly, now guided by AppKitStateShape
  const walletAddress = appKitState.account?.address;
  const isConnected = appKitState.connected;
  const currentConnector = appKitState.connector;
  const currentChainId = appKitState.chainId;

  const currentWalletType = getWalletTypeFromAppKitState(appKitState);

  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [presaleNetwork, setPresaleNetwork] = useState<"bsc" | "solana" | null>(
    null
  );
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [bscStatus, setBscStatus] = useState<PresaleStatus | null>(null);
  const [solanaStatus, setSolanaStatus] = useState<PresaleStatus | null>(null);
  const [userPurchasedTokens, setUserPurchasedTokens] = useState("0");

  const [cryptoPrices, setCryptoPrices] = useState<{
    bnb: number;
    sol: number;
  } | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<{
    bnb: number;
    sol: number;
  }>({ bnb: 0, sol: 0 });

  const presaleStatus = presaleNetwork === "bsc" ? bscStatus : solanaStatus;

  const hasConnectedWallet =
    (presaleNetwork === "bsc" && isConnected && currentWalletType === "bsc") ||
    (presaleNetwork === "solana" &&
      isConnected &&
      currentWalletType === "solana");

  const hasBscWalletConnected = isConnected && currentWalletType === "bsc";
  const hasSolanaWalletConnected =
    isConnected && currentWalletType === "solana";

  useEffect(() => {
    if (presaleNetwork !== "bsc") {
      setPresaleNetwork("bsc");
    }
  }, [presaleNetwork]);

  const loadCryptoPrices = useCallback(
    async (forceRefresh: boolean = false) => {
      setIsLoadingPrices(true);
      try {
        const prices = await fetchCryptoPrices(forceRefresh);
        setCryptoPrices(prices);
        if (tokenAmount > 0) {
          const bnbCost = calculateCryptoCost(tokenAmount, "bnb", prices);
          const solCost = calculateCryptoCost(tokenAmount, "sol", prices);
          setEstimatedCost({ bnb: bnbCost, sol: solCost });
        }
        if (forceRefresh) {
          toast.success("Cryptocurrency prices updated successfully");
        }
      } catch (error) {
        console.error("Error fetching crypto prices:", error);
        if (forceRefresh) {
          toast.error("Failed to fetch new cryptocurrency prices");
        } else {
          toast.error("Failed to fetch cryptocurrency prices");
        }
      } finally {
        setIsLoadingPrices(false);
      }
    },
    [tokenAmount]
  );

  useEffect(() => {
    loadCryptoPrices(false);
    const intervalId = setInterval(() => {
      loadCryptoPrices(true);
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [loadCryptoPrices]);

  useEffect(() => {
    if (cryptoPrices && tokenAmount > 0) {
      const bnbCost = calculateCryptoCost(tokenAmount, "bnb", cryptoPrices);
      const solCost = calculateCryptoCost(tokenAmount, "sol", cryptoPrices);
      setEstimatedCost({ bnb: bnbCost, sol: solCost });
    }
  }, [tokenAmount, cryptoPrices]);

  const calculateTokensFromCrypto = useCallback(
    (cryptoAmount: number, cryptoType: "bnb" | "sol") => {
      if (!cryptoPrices || cryptoAmount <= 0) return 0;
      return calculateTokenAmount(cryptoAmount, cryptoType, cryptoPrices);
    },
    [cryptoPrices]
  );

  const loadBscPresaleStatus = useCallback(async () => {
    const status = await bscPresale.getPresaleStatus();
    if (status) {
      setBscStatus(status);
    }
  }, []);

  const loadSolanaPresaleStatus = useCallback(async () => {
    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
          "https://api.devnet.solana.com"
      );
      const status = await solanaPresale.getPresaleStatus(connection);
      if (status) {
        setSolanaStatus(status);
      }
    } catch (error) {
      console.error("Error loading Solana presale status:", error);
      toast.error("Failed to load Solana presale data");
    }
  }, []);

  const loadUserPurchasedTokens = useCallback(async () => {
    if (isConnected && currentWalletType === "bsc" && walletAddress) {
      const tokens = await bscPresale.getUserPurchasedTokens(walletAddress);
      setUserPurchasedTokens(tokens);
    }
  }, [isConnected, currentWalletType, walletAddress]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Loading BSC presale status...");
        await loadBscPresaleStatus();
        if (isConnected && currentWalletType === "bsc") {
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
    isConnected,
    currentWalletType,
    loadBscPresaleStatus,
    loadUserPurchasedTokens,
  ]);

  const buyTokens = async (amount: number, referrer?: string) => {
    if (isBuying) return;
    if (presaleNetwork !== "bsc") {
      toast.info("Only BSC purchases are currently supported");
      setPresaleNetwork("bsc");
    }

    setIsBuying(true);
    try {
      let success = false;
      if (!(isConnected && currentWalletType === "bsc")) {
        toast.error(
          "BSC wallet not connected. Please connect your BSC wallet."
        );
        modal.open(); // Open default modal view
        setIsBuying(false);
        return;
      }
      success = await bscPresale.buyTokens(amount, referrer);
      if (success) {
        await loadBscPresaleStatus();
        await loadUserPurchasedTokens();
      }
    } catch (error: any) {
      console.error("Error buying tokens:", error);
      toast.error(error.message || "Failed to purchase tokens");
    } finally {
      setIsBuying(false);
    }
  };

  const switchNetwork = (network: "bsc" | "solana") => {
    if (network === "solana") {
      toast.info("Solana presale is currently disabled. Using BSC instead.");
      network = "bsc";
    }
    if (network === "bsc" && !(isConnected && currentWalletType === "bsc")) {
      toast.info("Consider connecting your BSC wallet to enable buying tokens");
      modal.open(); // Open default modal view
    }
    setPresaleNetwork(network);
  };

  const signReferralCode = async (referralCode: string) => {
    if (
      !(
        isConnected &&
        currentWalletType === "solana" &&
        walletAddress &&
        currentConnector?.provider
      )
    ) {
      toast.error("Solana wallet not connected or provider not available.");
      modal.open();
      return null;
    }

    try {
      const { signReferralWithSolana } = await import("@/lib/referral-signer");
      // currentConnector is now from appKitState and typed by AppKitStateShape
      const solanaProvider = currentConnector.provider as any;

      if (
        !solanaProvider ||
        typeof solanaProvider.sendTransaction !== "function"
      ) {
        toast.error(
          "Solana wallet provider does not support sendTransaction or is not available."
        );
        return null;
      }

      // walletAddress is now from appKitState and typed by AppKitStateShape
      if (!walletAddress) {
        toast.error("Solana wallet address not available.");
        return null;
      }
      const solanaPublicKey = new PublicKey(walletAddress);

      const walletApiForSigning = {
        publicKey: solanaPublicKey,
        sendTransaction: async (
          transaction: Transaction,
          connection: Connection,
          options?: SendOptions
        ) => {
          const signature = await solanaProvider.sendTransaction(
            transaction,
            connection,
            options
          );
          return typeof signature === "string"
            ? signature
            : signature.signature;
        },
      };

      // Corrected to 2 arguments for signReferralWithSolana
      const signedReferral = await signReferralWithSolana(
        referralCode,
        walletApiForSigning
      );

      if (signedReferral) {
        toast.success("Referral code signed successfully");
        return signedReferral;
      }
    } catch (error) {
      console.error("Error signing referral code:", error);
      toast.error("Failed to sign referral code");
    }
    return null;
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
    walletAddress,
    currentWalletType,
    connected: isConnected,
    connectWallet: () => modal.open(), // Open default modal view
    setTokenAmount,
    buyTokens,
    switchNetwork,
    signReferralCode,
    cryptoPrices,
    estimatedCost,
    isLoadingPrices,
    loadCryptoPrices,
    calculateTokensFromCrypto,
    lmxPriceUsd: LMX_PRICE_USD,
    refreshData: async () => {
      setIsLoading(true);
      await Promise.all([
        loadBscPresaleStatus(),
        loadCryptoPrices(true),
        isConnected && currentWalletType === "bsc"
          ? loadUserPurchasedTokens()
          : Promise.resolve(),
      ]);
      toast.success("Presale data refreshed");
      setIsLoading(false);
    },
  };
}
