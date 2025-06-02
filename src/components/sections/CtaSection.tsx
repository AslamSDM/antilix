"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import "../sections/animation-utils.css";

interface CtaSectionProps {
  isVisible: boolean;
}

export default function CtaSection({ isVisible }: CtaSectionProps) {
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
        willChange: "opacity",
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
          className="text-6xl md:text-8xl font-normal text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Join Litmex Presale Now
        </motion.h1>
      </motion.div>

      {/* Main content - center */}
      <motion.div
        className="floating-text center-center floating-animation-slow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className="text-xl text-white/90 max-w-lg text-center mb-8">
          Early investors gain exclusive benefits, reduced fees, and priority
          access to premium features.
        </p>
        <div className="flex justify-center">
          <Link href="/presale" className="inline-block">
            <button className="bg-primary text-primary-foreground px-8 py-4 text-lg hover:scale-105 transition-all duration-300 ease-out rounded-md flex items-center">
              <span className="mr-2">Buy LITMEX Tokens</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Additional text - bottom center */}
      <motion.div
        className="floating-text center-bottom floating-animation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <p className="text-sm text-white/70">
          Limited allocation available • Early bird bonus ends soon
        </p>
      </motion.div>

      {/* Additional floating elements */}
      <motion.div
        className="floating-text top-left floating-animation-fast"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Early Access</p>
      </motion.div>

      <motion.div
        className="floating-text top-right floating-animation"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <p className="text-lg text-primary/80">25% Bonus</p>
      </motion.div>
    </motion.div>
  );
}
