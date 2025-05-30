"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Disable transition animation on first render and set ready after a delay
  useEffect(() => {
    setIsFirstRender(false);

    // A tiny delay to ensure transitions are properly handled
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  // Enhanced variants with specific focus on fade transitions between pages
  const variants = {
    initial: {
      opacity: 0,
      y: 20,
      filter: "blur(100px)",
    },
    in: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
    out: {
      opacity: 0,
      y: -20,
      filter: "blur(100px)",
    },
  };

  // Use different transition options for different paths
  const getTransition = (path: string) => {
    // Default transition
    const defaultTransition = {
      type: "tween",
      ease: "easeIn",
      duration: 0.5,
    };

    // Specific transitions for routes
    if (path === "/" || path === "/about") {
      return {
        type: "tween",
        ease: "easeIn",
        duration: 0.6,
      };
    }

    return defaultTransition;
  };

  // Don't render anything until ready, prevents flash of content
  if (isFirstRender) {
    return null;
  }

  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        //    initial={{ y: 20, opacity: 0 }}
        // animate={{ y: 0, opacity: 1 }}
        // transition={{ ease: "easeInOut", duration: 0.75 }}
        key={pathname}
        variants={variants}
        initial="initial"
        animate="in"
        exit="out"
        transition={getTransition(pathname)}
        className="w-full min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
