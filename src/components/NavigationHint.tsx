"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationHintProps {
  isSmallScreen: boolean;
}

const NavigationHint: React.FC<NavigationHintProps> = ({ isSmallScreen }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isSmallScreen || !isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-8 right-8 bg-black/50 backdrop-blur-md text-white px-4 py-3 rounded-lg z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className="absolute top-2 right-2 text-white/70 hover:text-white"
        onClick={() => setIsVisible(false)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex flex-col items-center space-y-3 mt-3">
        <div className="flex flex-col items-center">
          <motion.div
            className="inline-block border border-white/30 rounded px-6 py-1 text-sm"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Space
          </motion.div>
          <span className="text-xs text-white/70">Press to navigate</span>
        </div>

        <div className="text-xs text-white/70 text-center">or</div>

        <div className="flex flex-col items-center">
          <motion.div
            className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              2×
            </motion.div>
          </motion.div>
          <span className="text-xs text-white/70">Double tap to navigate</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NavigationHint;
