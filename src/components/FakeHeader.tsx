"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";

const navLinks = [{ href: "/presale", label: "Presale" }];

export function FakeHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (typeof window !== "undefined") {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollTop > 20);
    }
  }, []);

  // Handle scroll effect with proper cleanup and throttling
  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    let ticking = false;

    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add passive event listener for better performance
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    // Call once to set initial state
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [isClient, handleScroll]);

  // Prevent scroll event during mobile menu transitions
  useEffect(() => {
    if (mobileMenuOpen && typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    } else if (typeof document !== "undefined") {
      document.body.style.overflow = "unset";
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [mobileMenuOpen]);

  // Fake sign-in handler (does nothing)
  const handleFakeSignIn = useCallback(() => {
    router.push("/auth/signin");
  }, [router]);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Don't render on certain paths
  if (pathname === "/presale" || pathname === "/profile") return null;

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <header className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 py-2 sm:py-3 w-[97%] sm:w-[95%] md:w-[85%] lg:w-[75%] translate-y-2 sm:translate-y-4 backdrop-blur-lg bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl">
        <div className="px-2 sm:px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/lit_logo.png"
              alt="Litmex Logo"
              width={60}
              height={60}
              className="mr-2 w-[50px] min-w-[50px] h-auto sm:w-[60px] sm:min-w-[60px] md:w-[70px] md:min-w-[70px]"
              priority
            />
            <span className="text-white font-bold text-lg md:hidden">
              LITMEX
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-auto text-primary"
            >
              <LogIn size={16} />
            </Button>
            <Menu className="w-5 h-5 text-white md:hidden" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 backdrop-blur-lg bg-black/30 border border-white/10 rounded-xl sm:rounded-2xl ${
        scrolled
          ? "py-1.5 sm:py-2 w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] translate-y-0 shadow-lg"
          : "py-2 sm:py-3 w-[97%] sm:w-[95%] md:w-[85%] lg:w-[75%] translate-y-2 sm:translate-y-4"
      }`}
    >
      <div className="px-2 sm:px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/lit_logo.png"
            alt="Litmex Logo"
            width={60}
            height={60}
            className="mr-2 w-[50px] min-w-[50px] h-auto sm:w-[60px] sm:min-w-[60px] md:w-[70px] md:min-w-[70px]"
            priority
          />
          <span className="text-white font-bold text-lg md:hidden">LITMEX</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative group ${
                pathname === link.href ? "text-primary" : "text-white/80"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
            </Link>
          ))}
          <div className="h-5 w-px bg-white/20" />
          <div className="flex items-center gap-3">
            {/* Login button */}
            <Button
              variant="outline"
              size="sm"
              className="border-primary/40 text-primary hover:bg-primary/10"
              onClick={handleFakeSignIn}
            >
              <LogIn size={16} className="mr-1.5" />
              Sign In
            </Button>

            {pathname !== "/presale" && (
              <Link href="/presale" className="hidden lg:block">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none group relative overflow-hidden"
                  onClick={closeMobileMenu}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#8a63d2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    Buy Now
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center space-x-2">
          {/* Login button when not logged in */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 h-auto text-primary hover:bg-primary/10"
            onClick={handleFakeSignIn}
          >
            <LogIn size={16} />
          </Button>

          <button
            className="text-white focus:outline-none p-1.5 touch-manipulation"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden overflow-hidden"
        initial="closed"
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            height: "auto",
            display: "block",
            transition: { duration: 0.2, ease: "easeOut" },
          },
          closed: {
            opacity: 0,
            height: 0,
            transition: { duration: 0.2, ease: "easeIn" },
            transitionEnd: { display: "none" },
          },
        }}
      >
        <div className="mx-2 sm:mx-4 my-2 px-3 py-3 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-1.5 transition-colors hover:bg-white/10 rounded touch-manipulation ${
                  pathname === link.href
                    ? "text-primary border-l-2 border-primary pl-2.5"
                    : "text-white/80"
                }`}
                onClick={closeMobileMenu}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-primary/10">
              <div className="mb-3 mt-2">
                <Button
                  className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary touch-manipulation"
                  onClick={() => {
                    handleFakeSignIn();
                    closeMobileMenu();
                  }}
                >
                  <LogIn size={16} className="mr-2" />
                  Sign In
                </Button>
              </div>

              <Link href="/presale" className="block mb-3">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-none group relative overflow-hidden touch-manipulation"
                  onClick={closeMobileMenu}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#8a63d2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-1">
                    Buy Now
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
