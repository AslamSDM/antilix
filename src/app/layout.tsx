import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PageTransition from "@/components/PageTransition";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxScape - 3D Web Experiences",
  description: "Interactive 3D web experiences with Next.js and Spline",
  keywords: [
    "3D web",
    "Next.js",
    "Spline",
    "Interactive design",
    "Web animations",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={
          {
            "--header-height": "3.5rem", // Define header height for use in other components
            scrollBehavior: "smooth", // Smooth scrolling for the entire app
          } as React.CSSProperties
        }
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/50">
              <div className="container flex h-14 items-center justify-between">
                <Link
                  href="/"
                  className="font-bold text-xl flex items-center gap-2"
                >
                  <div className="relative w-6 h-6 bg-primary/20 rounded-md overflow-hidden flex items-center justify-center">
                    <div className="absolute w-4 h-4 rounded-full bg-primary/70" />
                  </div>
                  <span>FluxScape</span>
                </Link>
                <div className="flex items-center gap-6">
                  <nav className="hidden md:flex items-center gap-6">
                    <Link
                      href="/"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      Home
                    </Link>
                    <Link
                      href="/about"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      About
                    </Link>
                  </nav>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Account for fixed header height */}
            <div className="h-14"></div>

            <main className="flex-grow">
              <PageTransition>{children}</PageTransition>
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
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} FluxScape. All rights
                  reserved.
                  <br />
                  <span className="text-xs">
                    Built with Next.js, Tailwind CSS, and Spline 3D
                  </span>
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
