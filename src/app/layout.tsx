import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import LoadingScreen from "@/components/LoadingScreen";
import NavigationLoadingHandler from "@/components/NavigationLoadingHandler";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { FluxDock } from "@/components/FluxDock";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Inter, Playfair_Display } from "next/font/google";
import { AntilixhLogo } from "@/components/AntilixhLogo";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { Header } from "@/components/Header";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ANTILIXH | Premium Web3 Gaming Platform",
  description:
    "A luxury web3 gaming platform offering provably fair games and exclusive rewards",
  keywords: [
    "Web3 gaming",
    "Blockchain casino",
    "ANTILIXH",
    "Crypto gambling",
    "NFT gaming",
    "Presale",
    "Crypto games",
    "Provably fair",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
        style={
          {
            "--header-height": "3.5rem", // Define header height for use in other components
            scrollBehavior: "smooth", // Smooth scrolling for the entire app
          } as React.CSSProperties
        }
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LoadingProvider>
            {/* Global loading screen */}
            <LoadingScreen />

            {/* Handle loading on navigation */}
            <NavigationLoadingHandler />

            <div className="min-h-screen flex flex-col bg-background text-foreground">
              {/* Navigation Header */}
              <Header />

              {/* Interactive grid pattern as fixed background */}
              <div className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden z-0">
                <InteractiveGridPattern
                  className="fixed w-full h-full opacity-40"
                  width={50}
                  height={50}
                  squares={[30, 30]}
                />
              </div>

              <main className="flex-grow relative z-10 pt-0">
                <ScrollProgress />
                <PageTransition>{children}</PageTransition>
                <FluxDock />
              </main>

              <footer className="py-8 md:py-12 border-t border-border/40 bg-muted/30">
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
                      href="/about"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      About
                    </Link>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} ANTILIXH. All rights
                    reserved.
                    <br />
                    <span className="text-xs">
                      Premium Web3 Gaming Platform
                    </span>
                  </p>
                </div>
              </footer>
            </div>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
