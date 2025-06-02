import type { Metadata, Viewport } from "next"; // Added Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { WalletProviders } from "@/components/providers/wallet-provider";
import LoadingScreen from "@/components/LoadingScreen";
import NavigationLoadingHandler from "@/components/NavigationLoadingHandler";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { FluxDock } from "@/components/FluxDock";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Inter, Playfair_Display } from "next/font/google";
import { AnimatedBackgroundGrid } from "@/components/AnimatedBackgroundGrid";
import { Header } from "@/components/Header";
import { Suspense } from "react";
import localFont from "next/font/local";
const blackBird = localFont({
  src: "../../public/fonts/blackbird.otf",
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
  metadataBase: new URL("https://antilix.com"), // Added metadataBase - REPLACE with your actual domain
  title: "ANTILIX | Premium Web3 Gaming Platform",
  description:
    "A luxury web3 gaming platform offering provably fair games and exclusive rewards",
  keywords: [
    "Web3 gaming",
    "Blockchain casino",
    "ANTILIX",
    "Crypto gambling",
    "NFT gaming",
    "Presale",
    "Crypto games",
    "Provably fair",
  ],
  // Icons will be automatically handled by icon.tsx and apple-icon.tsx
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],

    other: [{ rel: "mask-icon", url: "/favicon.svg", color: "#D4AF37" }],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "ANTILIX",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // Added viewport export
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={` ${blackBird.className} antialiased`}
        style={
          {
            "--header-height": "3.5rem", // Define header height for use in other components
            scrollBehavior: "smooth", // Smooth scrolling for the entire app
          } as React.CSSProperties
        }
      >
        <LoadingProvider>
          <Suspense fallback={<LoadingScreen />}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <WalletProviders>
                {/* Global loading screen */}
                <LoadingScreen />

                {/* Handle loading on navigation */}
                <NavigationLoadingHandler />

                <div className="min-h-screen flex flex-col bg-background text-foreground">
                  {/* Navigation Header */}
                  <Header />

                  {/* Animated background grid pattern */}
                  {/* <AnimatedBackgroundGrid className="z-0" /> */}

                  <main className="flex-grow relative z-20 pt-0">
                    <ScrollProgress />
                    <PageTransition>{children}</PageTransition>
                    <FluxDock />
                  </main>

                  {/* <footer className="py-8 md:py-12 border-t border-border/40 bg-muted/30">
                    <div className="container flex flex-col items-center justify-center gap-4 text-center">
                      <div className="flex items-center justify-center space-x-4 mb-2">
                        <Link
                          href="/"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Home
                        </Link>
                        <span className="text-muted-foreground/30">•</span>
                        <Link
                          href="/presale"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Presale
                        </Link>
                        <span className="text-muted-foreground/30">•</span>
                        <Link
                          href="/profile"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Profile
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} ANTILIX. All rights
                        reserved.
                        <br />
                        <span className="text-xs">
                          Premium Web3 Gaming Platform
                        </span>
                      </p>
                    </div>
                  </footer> */}
                </div>
              </WalletProviders>
            </ThemeProvider>
          </Suspense>
        </LoadingProvider>
      </body>
    </html>
  );
}
