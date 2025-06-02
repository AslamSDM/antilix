"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import "../sections/animation-utils.css";

interface SecuritySectionProps {
  isVisible: boolean;
}

export default function SecuritySection({ isVisible }: SecuritySectionProps) {
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
          className="text-6xl md:text-8xl font-normal text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Guaranteed Security
        </motion.h1>
      </motion.div>

      {/* Icon - top left */}
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
        <ShieldCheck className="w-12 h-12 text-primary" />
      </motion.div>

      {/* Subtitle - center top */}
      <motion.div
        className="floating-text top-right floating-animation-slow slide-in"
        animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <p className="text-lg text-primary/80 font-normal">
          Bulletproof Protocol
        </p>
      </motion.div>

      {/* Main description - center right */}
      <motion.div
        className="floating-text center-right paragraph-text"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 30 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p className="text-white/90 mb-3">
          Bank-level encryption and multi-layer security systems protect all
          transactions.
        </p>
        <p className="text-white/90">
          Multiple security audits by leading blockchain security firms and
          open-source code.
        </p>
      </motion.div>

      {/* Additional floating elements */}
      <motion.div
        className="floating-text offset-top-right floating-animation-fast"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-lg text-primary/80">Audited</p>
      </motion.div>

      <motion.div
        className="floating-text random-middle floating-animation"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <p className="text-lg text-primary/80">Encrypted</p>
      </motion.div>

      <motion.div
        className="floating-text offset-bottom-left floating-animation-slow"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <p className="text-lg text-primary/80">Protected</p>
      </motion.div>
    </motion.div>
  );
}
