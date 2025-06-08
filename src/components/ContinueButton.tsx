"use client";

import React from "react";
import { motion } from "framer-motion";

interface ContinueButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const ContinueButton: React.FC<ContinueButtonProps> = ({
  onClick,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <motion.button
      className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600/80 to-blue-500/80 backdrop-blur-md text-white px-6 py-3 rounded-full z-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>Continue</span>
      <motion.div
        animate={{ x: [0, 3, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5L12 19M12 19L18 13M12 19L6 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
};

export default ContinueButton;
