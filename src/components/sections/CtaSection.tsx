"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import "../sections/animation-utils.css";
import { HyperText } from "../magicui/hyper-text";
import { VelocityScroll } from "../magicui/scroll-based-velocity";

interface CtaSectionProps {
  isVisible: boolean;
}

export default function CtaSection({ isVisible }: CtaSectionProps) {
  return (
    <motion.div
      className="sticky top-0 left-0 w-screen h-screen z-10 overflow-hidden flex flex-col justify-between"
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
        className="title-text absolute bottom-20 left-12"
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
          Join Presale Now
        </motion.h1>
      </motion.div>

      {/* Main content - right side */}
      <motion.div
        className="floating-text floating-animation-slow absolute right-12 top-1/2 transform -translate-y-1/2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <p className="text-xl text-white/90 max-w-lg text-right mb-8">
          Early investors gain exclusive benefits, reduced fees, and priority
          access to premium features.
        </p>
        <div className="flex justify-end">
          <Link href="/presale" className="inline-block">
            {/* <button className="bg-primary text-primary-foreground px-8 py-4 text-lg hover:scale-105 transition-all duration-300 ease-out rounded-md flex items-center">
              <span className="mr-2">Buy LITMEX Tokens</span>
              <ChevronRight className="w-5 h-5" />
            </button> */}
          </Link>
        </div>
      </motion.div>

      {/* Additional text - moved to bottom right */}
      <motion.div
        className="floating-text floating-animation absolute right-12 bottom-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <p className="text-sm text-white/70">
          Limited allocation available • Early bird bonus ends soon
        </p>
      </motion.div>
      <VelocityScroll className="z-[-10] absolute bottom-8 right-20">
        <span className="text-5xl md:text-7xl font-display text-primary">
          JOIN
        </span>
      </VelocityScroll>

      {/* Additional floating elements - more spread out positions */}
      <motion.div
        className="floating-text floating-animation-fast absolute top-16 left-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Early Access</p>
      </motion.div>

      <motion.div
        className="floating-text floating-animation absolute top-1/3 left-1/4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <p className="text-lg text-primary/80">25% Bonus</p>
      </motion.div>

      {/* Additional floating elements for better distribution */}
      <motion.div
        className="floating-text floating-animation-slow absolute bottom-1/3 left-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <p className="text-lg text-primary/80">Exclusive Benefits</p>
      </motion.div>
    </motion.div>
  );
}
