"use client";

import React from "react";
import { motion } from "framer-motion";
import "../sections/animation-utils.css";

interface BettingMarketsSectionProps {
  isVisible: boolean;
}

export default function BettingMarketsSection({
  isVisible,
}: BettingMarketsSectionProps) {
  return (
    <motion.div
      className="sticky top-0 left-0 w-screen h-screen z-10 overflow-hidden"
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
      {/* Title - huge at bottom left */}
      <motion.div
        className="title-text"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="angular-bg slide-in-bg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-display text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Bet on Anything
          </motion.h1>
        </motion.div>
      </motion.div>

      {/* Subtitle - top right */}
      <motion.div
        className="floating-text top-right floating-animation-slow slide-in"
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <p className="text-lg text-primary/80 font-display">
          Any Event, Any Time
        </p>
      </motion.div>

      {/* Main description - center right */}
      <motion.div
        className="floating-text center-left paragraph-text  slide-in"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-white/90 mb-3">
          Predict the World speaks to everything politics, sports,
          entertainment, finance, etc.
        </p>
      </motion.div>
    </motion.div>
  );
}
