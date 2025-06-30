import type { Metadata, Viewport } from "next"; // Added Viewport
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import ContextProviderAsWalletProviders from "@/components/providers/wallet-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { FluxDock } from "@/components/FluxDock";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import localFont from "next/font/local";
import { headers } from "next/headers"; // Import cookies

import { SolanaWalletPrompt } from "@/components/SolanaWalletPrompt";
import { Toaster } from "sonner";

const blackBird = localFont({
  src: "../../public/fonts/ductile.otf",
  variable: "--font-display",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// const playfairDisplay = Playfair_Display({
//   variable: "--font-display",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  metadataBase: new URL("https://litmexpresale.com"), // Added metadataBase - REPLACE with your actual domain
  title: "Litmex | Premium Web3 Gaming Platform",
  description:
    "A luxury web3 gaming platform offering provably fair games and exclusive rewards",
  keywords: [
    "Web3 gaming",
    "Blockchain casino",
    "Litmex",
    "Crypto gambling",
    "NFT gaming",
    "Presale",
    "Crypto games",
    "Provably fair",
  ],
  icons: {
    icon: [{ url: "/lit_logo.ico", sizes: "32x32" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get("cookie");
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${geistMono.className} ${blackBird.variable} antialiased`}
        style={
          {
            "--header-height": "3.5rem", // Define header height for use in other components
            scrollBehavior: "smooth", // Smooth scrolling for the entire app
          } as React.CSSProperties
        }
      >
        <LoadingProvider>
          <Suspense fallback={<></>}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <AuthProvider>
                <ContextProviderAsWalletProviders cookies={cookies}>
                  {/* Global loading screen */}
                  <Toaster />

                  {/* Handle loading on navigation */}
                  {/* <NavigationLoadingHandler /> */}

                  {/* Automatic referral application when user is authenticated */}

                  {/* Prompt for Solana wallet connection */}
                  <SolanaWalletPrompt />

                  {/* Navigation Header */}
                  <Header />

                  <main className="flex-grow relative z-20 pt-0">
                    <ScrollProgress />
                    {children}
                    <FluxDock />
                    <Footer />
                  </main>

                  {/* Footer */}
                </ContextProviderAsWalletProviders>
              </AuthProvider>
            </ThemeProvider>
          </Suspense>
        </LoadingProvider>
      </body>
    </html>
  );
}
