"use client";

import {
  wagmiAdapter,
  solanaWeb3JsAdapter,
  projectId,
  networks,
} from "@/lib/wagmi-config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { bsc } from "viem/chains";

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: "next-reown-appkit",
  description: "next-reown-appkit",
  url: "https://github.com/0xonerb/next-reown-appkit-ssr", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  projectId,
  networks,
  metadata,
  themeMode: "dark",
  defaultNetwork: networks[0], // Default to first network (Solana)
  features: {
    analytics: true,
    socials: false,
    email: false,
    allWallets: false,
  },
  themeVariables: {
    "--w3m-accent": "#3b82f6", // Blue accent to match our app theme
  },
  tokens: {
    "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": {
      address: "Sol1111111111111111111111111111111111",
    },
    "eip155:56:0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": {
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // BNB
    },
  },
  excludeWalletIds: [
    // "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
    // "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
  ],

  defaultAccountTypes: {
    solana: "eoa",
  },
  enableWallets: true,
  enableInjected: true,
  enableAuthLogger: false,
  enableCoinbase: true,
  debug: false, // Disable debug mode in production

  allowUnsupportedChain: false,
  enableWalletConnect: true,
  allWallets: "SHOW", // Show all wallets for better UX
  enableNetworkSwitch: true,
  enableWalletGuide: true,
  showWallets: true, // Show wallet options by default
});

function ContextProviderAsWalletProviders({
  children,
  cookies,
}: // cookies,
{
  children: ReactNode;
  cookies: string | null;
}) {
  // Use the cookies to derive the initial state if provided
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProviderAsWalletProviders;
