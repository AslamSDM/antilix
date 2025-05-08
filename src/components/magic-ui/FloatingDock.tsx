"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type FloatingDockProps = {
  items?: NavItem[];
  className?: string;
};

const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];

export const FloatingDock: React.FC<FloatingDockProps> = ({
  items = defaultNavItems,
  className,
}) => {
  const pathname = usePathname();

  return (
    <motion.div
      className={cn("z-50", className)}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
    >
      <div className="flex w-screen items-center gap-1 px-4 py-3 rounded-full bg-background/80 backdrop-blur-lg border border-border/20 shadow-lg">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === "/" && item.href === "/") ||
            (item.href.startsWith("#") && pathname === "/" + item.href);

          return (
            <Link href={item.href} key={item.href}>
              <motion.div
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    layoutId="nav-highlight"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};
