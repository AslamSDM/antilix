"use client";

import React, { useState, useEffect } from "react";
import { Diamond } from "lucide-react";
import CardShuffle from "./CardShuffle";
import { useLoading } from "./providers/loading-provider";

const LoadingScreen: React.FC = () => {
  const { isLoading, progress } = useLoading();
  const [loadingStage, setLoadingStage] = useState(0);
  const [showText, setShowText] = useState(false);
  const [loadingTexts] = useState([
    "Shuffling cards...",
    "Setting up tables...",
    "Almost ready...",
  ]);

  // Simulate loading stages
  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => {
      if (loadingStage < loadingTexts.length - 1) {
        setLoadingStage((prev) => prev + 1);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [loadingStage, isLoading, loadingTexts.length]);

  // Show text with a slight delay for better animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadingStage]);

  // Reset text visibility on stage change
  useEffect(() => {
    setShowText(false);
  }, [loadingStage]);

  // If not loading, don't render
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-background/80 backdrop-blur-sm transition-opacity duration-500">
      <div className="w-full max-w-md px-8 py-12">
        {/* Diamond logo */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            {/* Spinning rings */}
            <div className="w-32 h-32 border-4 border-primary/40 border-t-transparent rounded-full animate-spin flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-primary/60 border-b-transparent rounded-full animate-spin-slow-reverse flex items-center justify-center">
                <div className="w-16 h-16 text-primary animate-pulse">
                  <Diamond className="h-full w-full" />
                </div>
              </div>
            </div>

            {/* Card shuffle animation */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
              <CardShuffle />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center mt-24">
          <h2 className="text-3xl font-display text-primary animate-pulse">
            ANTILIX
          </h2>
          <div className="h-8 mt-3">
            <p
              className={`text-sm text-muted-foreground transition-all duration-500 ${
                showText ? "opacity-100" : "opacity-0 transform -translate-y-2"
              }`}
            >
              {loadingTexts[loadingStage]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted/30 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.max(5, progress * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 text-primary/20">
          <Diamond className="w-8 h-8 animate-float animation-delay-700" />
        </div>
        <div className="absolute bottom-10 left-10 text-primary/20">
          <Diamond className="w-6 h-6 animate-float animation-delay-1200" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
