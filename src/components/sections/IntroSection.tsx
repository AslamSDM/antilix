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
      className="sticky top-0 left-0 w-screen h-screen z-30 overflow-hidden"
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
        className="title-text"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
        transition={{ duration: 0.6 }}
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
          The ultimate decentralized betting platform for the next generation of
          gamblers
        </p>
      </motion.div>

      {/* Additional floating elements - scattered along the sides */}
      <motion.div
        className="floating-text top-left slide-in"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: isVisible ? 0.8 : 0, x: isVisible ? 0 : -30 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Blockchain-powered</p>
      </motion.div>

      <motion.div
        className="floating-text top-right slide-in"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: isVisible ? 0.8 : 0, x: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <p className="text-lg text-primary/80">Transparent Odds</p>
      </motion.div>

      <motion.div
        className="floating-text bottom-right slide-in"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: isVisible ? 0.8 : 0, x: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <p className="text-lg text-primary/80">Community-driven</p>
      </motion.div>
    </motion.div>
  );
}
