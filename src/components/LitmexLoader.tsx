"use client";

import React, { useEffect, useState } from "react";
import { Diamond, Dice5, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface LitmexLoaderProps {
  isLoading: boolean;
}

const LitmexLoader: React.FC<LitmexLoaderProps> = ({ isLoading }) => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const loadingTexts = [
    "Connecting to blockchain network...",
    "Initializing betting protocol...",
    "Setting up smart contracts...",
    "Almost ready...",
  ];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingPhase((prev) =>
        prev < loadingTexts.length - 1 ? prev + 1 : prev
      );
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading, loadingTexts.length]);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full max-w-sm px-6 py-10 text-center">
        <div className="relative mx-auto mb-12">
          {/* Animated elements */}
          <div className="w-32 h-32 mx-auto relative">
            <motion.div
              className="absolute inset-0 border-4 border-primary/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="absolute inset-3 border-4 border-primary/50 border-dashed rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />

            {/* Icon orbit */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center center" }}
              >
                <motion.div
                  className="relative -left-4 -top-4 bg-black p-2 rounded-full border border-primary/40"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Dice5 className="h-5 w-5 text-primary" />
                </motion.div>
              </motion.div>
            </div>

            <div className="absolute inset-0">
              <motion.div
                className="absolute"
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{ transformOrigin: "center center" }}
              >
                <motion.div
                  className="relative left-28 top-10 bg-black p-2 rounded-full border border-primary/40"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, delay: 0.7, repeat: Infinity }}
                >
                  <Zap className="h-5 w-5 text-primary" />
                </motion.div>
              </motion.div>
            </div>

            {/* Center diamond */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Diamond className="h-12 w-12 text-primary" />
            </motion.div>
          </div>
        </div>

        <motion.h2
          className="text-3xl font-bold text-white mb-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          LITMEX <span className="text-primary">PROTOCOL</span>
        </motion.h2>

        <div className="h-8 overflow-hidden mt-4">
          <motion.p
            key={loadingPhase}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/70"
          >
            {loadingTexts[loadingPhase]}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 mt-8 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "5%" }}
            animate={{ width: `${(loadingPhase + 1) * 25}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LitmexLoader;
