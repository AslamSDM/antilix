"use client";

import React from "react";
import { motion } from "framer-motion";

interface SpacebarHintProps {
  isVisible: boolean;
}

const SpacebarHint: React.FC<SpacebarHintProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-8 right-8 bg-black/50 backdrop-blur-md text-white px-4 py-3 rounded-lg z-50 flex items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center space-y-1">
        <motion.div
          className="inline-block border border-white/30 rounded px-6 py-1 text-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Space
        </motion.div>
        <span className="text-xs text-white/70">Press to navigate</span>
      </div>
    </motion.div>
  );
};

export default SpacebarHint;
