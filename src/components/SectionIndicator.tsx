"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SectionIndicatorProps {
  sections: number;
  activeSection: number;
  orientation?: "vertical" | "horizontal";
}

export const SectionIndicator = ({
  sections,
  activeSection,
  orientation = "vertical",
}: SectionIndicatorProps) => {
  const dots = Array.from({ length: sections }, (_, i) => i);

  const containerClass =
    orientation === "vertical"
      ? "fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50"
      : "fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row gap-2 z-50";

  return (
    <div className={containerClass}>
      {dots.map((dot) => (
        <motion.div
          key={dot}
          className={`rounded-full ${
            orientation === "vertical" ? "w-2 h-8" : "w-8 h-2"
          } 
                    ${
                      dot === activeSection
                        ? "bg-primary shadow-glow"
                        : "bg-white/30"
                    } 
                    cursor-pointer transition-all duration-300`}
          whileHover={{ scale: 1.2 }}
          animate={{
            scale: dot === activeSection ? 1.2 : 1,
          }}
        />
      ))}
    </div>
  );
};

export default SectionIndicator;
