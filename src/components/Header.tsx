"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DecorativeIcon } from "./DecorativeElements";
import { WalletConnectButton } from "./WalletConnectButton";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/presale", label: "Presale" },
  { href: "/profile", label: "Profile" },
];

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
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 glassmorphic-navbar ${
        scrolled
          ? "py-3 w-[90%] md:w-[80%] lg:w-[70%] translate-y-0"
          : "py-4 w-[95%] md:w-[85%] lg:w-[75%] translate-y-4"
      }`}
    >
      <div className="px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-display font-bold text-primary mr-1">
            ANTI
          </span>
          <span className="text-2xl font-display font-bold">LIXH</span>
          <div className="ml-1 opacity-70">
            <DecorativeIcon icon="diamond" size="xs" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
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
          <div className="flex items-center gap-4">
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
        <div className="container mx-auto px-4 py-4 bg-black/90 backdrop-blur-lg border-t border-primary/20">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-4 py-2 transition-colors hover:bg-primary/10 rounded ${
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
              <WalletConnectButton className="w-full mt-2" />
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
