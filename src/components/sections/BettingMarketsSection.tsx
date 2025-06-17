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
        <motion.h1
          className="text-6xl md:text-8xl font-display text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Limitless Betting Markets
        </motion.h1>
      </motion.div>

      {/* Icon - top left
      <motion.div
        className="floating-text top-left floating-animation"
        animate={
          isVisible
            ? { scale: 1, opacity: 1, rotate: 0 }
            : { scale: 0.5, opacity: 0, rotate: -10 }
        }
        transition={{
          duration: 0.6,
          delay: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        whileHover={{
          scale: 1.1,
          rotate: 5,
          transition: { duration: 0.2 },
        }}
      >
        <Dice5 className="w-12 h-12 text-primary" />
      </motion.div> */}

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
        className="floating-text center-left paragraph-text hidden md:block"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-white/90 mb-3">
          Create and participate in betting markets for any event - sports,
          politics, finance and more.
        </p>
        <p className="text-white/90">
          User-generated markets with custom odds allow for unparalleled betting
          opportunities.
        </p>
      </motion.div>

      {/* Additional floating elements */}
      <motion.div
        className="floating-text random-middle floating-animation-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Sports</p>
      </motion.div>

      <motion.div
        className="floating-text offset-bottom-left floating-animation"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <p className="text-lg text-primary/80">Politics</p>
      </motion.div>

      <motion.div
        className="floating-text random-top floating-animation-fast"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <p className="text-lg text-primary/80">Finance</p>
      </motion.div>
    </motion.div>
  );
}
