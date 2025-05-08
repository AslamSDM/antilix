"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface BackgroundTextProps {
  text: string;
  className?: string;
}

const BackgroundText: React.FC<BackgroundTextProps> = ({ text, className }) => {
  const { scrollYProgress } = useScroll();

  // Text fades out as we scroll
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.1, 0]);
  // Text scales slightly as we scroll
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <motion.div
      className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ opacity, scale }}
    >
      <h2
        className="text-[20vw] font-bold text-foreground/5 whitespace-nowrap"
        aria-hidden="true"
      >
        {text}
      </h2>
    </motion.div>
  );
};

export default BackgroundText;
