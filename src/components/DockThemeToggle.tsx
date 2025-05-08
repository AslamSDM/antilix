"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function DockThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-full focus:outline-none"
      aria-label="Toggle theme"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "dark" ? 0 : 180,
            scale: theme === "dark" ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute"
        >
          <Moon size={28} strokeWidth={1.5} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{
            rotate: theme === "dark" ? -180 : 0,
            scale: theme === "dark" ? 0 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute"
        >
          <Sun size={28} strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.button>
  );
}
