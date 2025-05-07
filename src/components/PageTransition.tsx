"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Disable transition animation on first render
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  // Enhanced variants for more sophisticated transitions
  const variants = {
    initial: (isFirstRender: boolean) => ({
      opacity: isFirstRender ? 1 : 0,
      x: isFirstRender ? 0 : "-100vw",
      scale: isFirstRender ? 1 : 0.95,
      filter: "blur(8px)",
    }),
    in: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    out: {
      opacity: 0,
      x: "100vw",
      scale: 1.05,
      filter: "blur(8px)",
    },
  };

  // Use different transition options for different paths
  const getTransition = (path: string) => {
    // Default transition
    const defaultTransition = {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.7,
    };

    // For specific routes, customize the transition
    if (path === "/about") {
      return {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.6,
      };
    }

    return defaultTransition;
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        custom={isFirstRender}
        variants={variants}
        initial="initial"
        animate="in"
        exit="out"
        transition={getTransition(pathname)}
        className="overflow-x-hidden min-h-screen" // Prevent horizontal scrollbars during transition
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
