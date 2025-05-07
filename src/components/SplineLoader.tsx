"use client";
import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Load Spline dynamically
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

// Use an actual Spline scene URL for a loading animation
const LOADING_SPLINE_SCENE_URL =
  "https://prod.spline.design/jRUarFQ9X2yylmxW/scene.splinecode";

const SplineLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="w-64 h-64 md:w-96 md:h-96 relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Custom loading animation as fallback */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            <motion.div
              className="w-16 h-16 rounded-lg border-4 border-primary"
              animate={{
                rotateY: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-16 h-16 rounded-lg border-4 border-secondary absolute top-0 left-0"
              animate={{
                rotateX: [0, 180, 360],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
            />
          </div>

          <motion.p
            className="mt-8 text-foreground/90 text-lg font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading 3D Experience...
          </motion.p>

          <motion.div className="w-40 h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ x: [-160, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>

        {/* Use Spline loading scene if available */}
        <div className="absolute inset-0 opacity-40">
          {LOADING_SPLINE_SCENE_URL !==
            "YOUR_LOADING_SPLINE_SCENE_URL_HERE" && (
            <Spline scene={LOADING_SPLINE_SCENE_URL} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SplineLoader;
