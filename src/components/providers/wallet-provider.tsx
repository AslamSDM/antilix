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

  defaultAccountTypes: {
    solana: "eoa",
  },
  debug: true, // Disable debug mode in production

  allowUnsupportedChain: false,
  enableWalletConnect: true,
  allWallets: "SHOW", // Show all wallets for better UX
  enableNetworkSwitch: true,
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
