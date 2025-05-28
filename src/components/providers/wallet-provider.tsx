"use client";

import React, {
  FC,
  ReactNode,
  useMemo,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Default styles that can be overridden
import "@solana/wallet-adapter-react-ui/styles.css";

interface Props {
  children: ReactNode;
}

// Simple context for Ethereum wallet state
interface EthereumWalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const EthereumWalletContext = createContext<EthereumWalletContextType>({
  address: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useEthereumWallet = () => useContext(EthereumWalletContext);

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Simplified Ethereum wallet provider
export const EthereumWalletProvider: FC<Props> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Mock connect/disconnect functions for demo purposes
  // In a real app, these would use actual Ethereum wallet connection logic
  const connect = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 12);
    setAddress(mockAddress);
    setIsConnected(true);

    // Store connection in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("ethWalletConnected", "true");
      localStorage.setItem("ethWalletAddress", mockAddress);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);

    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("ethWalletConnected");
      localStorage.removeItem("ethWalletAddress");
    }
  };

  // Check for existing connection on mount
  useMemo(() => {
    if (typeof window !== "undefined") {
      const connected = localStorage.getItem("ethWalletConnected") === "true";
      const savedAddress = localStorage.getItem("ethWalletAddress");

      if (connected && savedAddress) {
        setAddress(savedAddress);
        setIsConnected(true);
      }
    }
  }, []);

  return (
    <EthereumWalletContext.Provider
      value={{
        address,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </EthereumWalletContext.Provider>
  );
};

export const WalletProviders: FC<Props> = ({ children }) => {
  return (
    <SolanaWalletProvider>
      <EthereumWalletProvider>{children}</EthereumWalletProvider>
    </SolanaWalletProvider>
  );
};
