import type { Metadata, Viewport } from "next"; // Added Viewport
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import ContextProviderAsWalletProviders from "@/components/providers/wallet-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import LoadingScreen from "@/components/LoadingScreen";
import NavigationLoadingHandler from "@/components/NavigationLoadingHandler";
import PageTransition from "@/components/PageTransition";
import { FluxDock } from "@/components/FluxDock";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Suspense } from "react";
import localFont from "next/font/local";
import { headers } from "next/headers"; // Import cookies

import AutomaticReferralHandler from "@/components/AutomaticReferralHandler"; // Import the automatic referral handler
import { SolanaWalletPrompt } from "@/components/SolanaWalletPrompt";

const blackBird = localFont({
  src: "../../public/fonts/ductile.otf",
  variable: "--font-display",
});

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  metadataBase: new URL("https://litmex.com"), // Added metadataBase - REPLACE with your actual domain
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
  // Icons will be automatically handled by icon.tsx and apple-icon.tsx
  icons: {
    icon: [{ url: "/lit_logo.ico", sizes: "32x32" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Litmex",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // Added viewport export
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
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
                  <LoadingScreen />

                  {/* Handle loading on navigation */}
                  <NavigationLoadingHandler />

                  {/* Automatic referral application when user is authenticated */}
                  <AutomaticReferralHandler />

                  {/* Prompt for Solana wallet connection */}
                  <SolanaWalletPrompt />

                  <div className="min-h-screen flex flex-col text-foreground">
                    {/* Navigation Header */}
                    <Header />

                    {/* Animated background grid pattern */}
                    {/* <AnimatedBackgroundGrid className="z-0" /> */}

                    <main className="flex-grow relative z-20 pt-0">
                      <ScrollProgress />
                      <PageTransition>{children}</PageTransition>
                      <FluxDock />
                    </main>

                    {/* Footer */}
                    <Footer />
                  </div>
                </ContextProviderAsWalletProviders>
              </AuthProvider>
            </ThemeProvider>
          </Suspense>
        </LoadingProvider>
      </body>
    </html>
  );
}
