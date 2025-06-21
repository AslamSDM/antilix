"use client";

import React from "react";
import { motion } from "framer-motion";
import "../sections/animation-utils.css";

interface IntroSectionProps {
  isVisible: boolean;
}

export default function IntroSection({ isVisible }: IntroSectionProps) {
  return (
    <motion.div
      className="sticky top-0 left-0 w-screen h-screen z-50 overflow-hidden "
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
      style={{
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      {/* Title text - huge at bottom left */}
      <motion.div
        className="title-text "
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="angular-bg slide-in-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ zIndex: 2, position: "relative" }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-display text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            LITMEX PROTOCOL
          </motion.h1>
        </motion.div>
      </motion.div>

      {/* Main description text - scattered on the left */}
      <motion.div
        className="floating-text center-left slide-in"
        initial={{ opacity: 0, x: -30 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          x: isVisible ? 0 : -30,
        }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <p className="text-xl text-white/90 max-w-lg">
          Built on Solana, Litmex combines decentralized prediction markets,
          addictive mini games, and autonomous AI betting agents. It&apos;s not
          just gambling it&apos;s intelligent, automated crypto wagering at
          scale.
        </p>
      </motion.div>

      {/* Additional floating elements - scattered along the sides */}
      <motion.div
        className="floating-text top-left slide-in hidden md:block"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: isVisible ? 0.8 : 0, x: isVisible ? 0 : -30 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Blockchain-powered</p>
      </motion.div>
    </motion.div>
  );
}
