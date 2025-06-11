"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DecorativeIcon } from "./DecorativeElements";
import { WalletConnectButton } from "./WalletConnectButton";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppKitNetwork } from "@reown/appkit/react";
import { solana, bscTestnet, base } from "@reown/appkit/networks";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/presale", label: "Presale" },
  { href: "/profile", label: "Profile" },
  { href: "/referral", label: "Referrals" },
];

// Network Selector Component
const NetworkSelector = () => {
  const { caipNetwork, chainId, switchNetwork } = useAppKitNetwork();
  const [currentNetwork, setCurrentNetwork] = useState<"bsc" | "solana">("bsc");

  // Update local network state based on chainId
  useEffect(() => {
    if (chainId === "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp") {
      setCurrentNetwork("solana");
    } else {
      setCurrentNetwork("bsc");
    }
  }, [chainId]);

  const handleNetworkChange = (value: string) => {
    if (value === "bsc" || value === "solana") {
      switchNetwork(value === "bsc" ? bscTestnet : solana);
      setCurrentNetwork(value as "bsc" | "solana");
    }
  };

  return (
    <Select value={currentNetwork} onValueChange={handleNetworkChange}>
      <SelectTrigger className="w-24 h-8 text-xs bg-black/30 border-white/10">
        <SelectValue placeholder="Network" />
      </SelectTrigger>
      <SelectContent className="bg-black/90 border-primary/20">
        <SelectItem value="bsc">BSC</SelectItem>
        <SelectItem value="solana">Solana</SelectItem>
        <SelectItem value="base">Base</SelectItem>
      </SelectContent>
    </Select>
  );
};

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 backdrop-blur-lg bg-black/30 border border-white/10 rounded-2xl ${
        scrolled
          ? "py-3 w-[90%] md:w-[80%] lg:w-[70%] translate-y-0 shadow-lg"
          : "py-4 w-[95%] md:w-[85%] lg:w-[75%] translate-y-4"
      }`}
    >
      <div className="px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={"/lit_logo.png"}
            alt="Litmex Logo"
            width={70}
            height={70}
            className="mr-2"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {/* {navLinks.map((link) => (
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
        ))} */}
          <div className="h-5 w-px bg-white/20" />
          <div className="flex items-center gap-4">
            <NetworkSelector />

            <Link href="/presale">
              <motion.button
                className="bg-gradient-to-r from-primary to-[#8a63d2] text-white font-display p-2 rounded-md shadow-lg flex items-center justify-center border border-white/20 backdrop-blur-sm relative overflow-hidden"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#ff7e33] to-[#ff4b8b] opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="absolute -inset-10 bg-white/20 rounded-full z-0 scale-0 opacity-0 font-display"
                  whileTap={{
                    scale: 4,
                    opacity: 0.3,
                    transition: { duration: 0.5 },
                  }}
                />
                <span className="mr-1 relative z-10">Buy Now</span>
                <motion.span
                  className="relative z-10"
                  initial={{ x: 0 }}
                  animate={{
                    x: [0, 5, 0],
                    rotate: [0, 0, 5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  →
                </motion.span>
              </motion.button>
            </Link>
            <WalletConnectButton />
            {/* <ThemeToggle /> */}
          </div>
        </nav>

        {/* Mobile Navigation Button */}
        <div className="md:hidden flex items-center space-x-4">
          <ThemeToggle />
          <button
            className="text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden"
        initial="closed"
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: "auto", display: "block" },
          closed: {
            opacity: 0,
            height: 0,
            transitionEnd: { display: "none" },
          },
        }}
      >
        <div className="mx-4 my-2 px-4 py-4 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-4 py-2 transition-colors hover:bg-white/10 rounded ${
                  pathname === link.href
                    ? "text-primary border-l-2 border-primary pl-3"
                    : "text-white/80"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-primary/10">
              <div className="flex items-center justify-between mb-3 mt-2">
                <span className="text-xs text-white/70">Select Network:</span>
                <NetworkSelector />
              </div>
              <WalletConnectButton className="w-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
