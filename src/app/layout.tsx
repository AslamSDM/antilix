import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { FluxDock } from "@/components/FluxDock";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { Inter } from "next/font/google";

const geistSans = Inter({
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
            {/* Scroll progress bar at the top of the page */}

            {/* Account for fixed header height */}

            <main className="flex-grow">
              <ScrollProgress />
              <PageTransition>{children}</PageTransition>
              <FluxDock />
            </main>

            {/* Flux dock with integrated theme toggle */}

            {/* Scroll indicator that appears at the top of the page */}

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
