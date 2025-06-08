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
import { useConnect, WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi-config";
import { useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

// Default styles that can be overridden
import "@solana/wallet-adapter-react-ui/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children: ReactNode;
}

// Ethereum wallet context with wagmi hooks
interface EthereumWalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const EthereumWalletContext = createContext<EthereumWalletContextType>({
  address: null,
  isConnected: false,
  connect: async () => {},
  disconnect: async () => {},
});

export const useEthereumWallet = () => useContext(EthereumWalletContext);

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  // Use devnet for testing
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

// Ethereum wallet provider using wagmi
export const EthereumWalletProvider: FC<Props> = ({ children }) => {
  // We'll use a client component wrapper to access wagmi hooks
  return (
    <WagmiProvider config={wagmiConfig}>
      <EthereumWalletProviderInner>{children}</EthereumWalletProviderInner>
    </WagmiProvider>
  );
};

// Inner component that uses wagmi hooks
const EthereumWalletProviderInner: FC<Props> = ({ children }) => {
  // Use wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect: wagmiConnect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Connect function using wagmi
  const connect = async () => {
    try {
      await wagmiConnect({ connector: injected() });

      // Check if we're on the correct chain (BSC Testnet)
      if (window.ethereum) {
        // Switch to BSC Testnet
        await window.ethereum
          ?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }], // '0x61' is hex for 97
          })
          .catch(async (switchError: any) => {
            // If chain is not added to MetaMask, add it
            if (switchError.code === 4902 || switchError.code === -32603) {
              await window.ethereum?.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x61",
                    chainName: "BSC Testnet",
                    nativeCurrency: {
                      name: "BNB",
                      symbol: "BNB",
                      decimals: 18,
                    },
                    rpcUrls: [
                      "https://data-seed-prebsc-1-s1.binance.org:8545/",
                    ],
                    blockExplorerUrls: ["https://testnet.bscscan.com/"],
                  },
                ],
              });
            }
          });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Disconnect function using wagmi
  const disconnect = async () => {
    try {
      await wagmiDisconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <EthereumWalletContext.Provider
      value={{
        address: address ?? null,
        isConnected: !!isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </EthereumWalletContext.Provider>
  );
};

export const WalletProviders: FC<Props> = ({ children }) => {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          <EthereumWalletProvider>{children}</EthereumWalletProvider>
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
