"use client";

import React from "react";

interface ScrollDebugProps {
  scrollProgress: number;
  activeSection: number;
  sectionVisibility: boolean[];
}

export default function ScrollDebug({
  scrollProgress,
  activeSection,
  sectionVisibility,
}: ScrollDebugProps) {
  const sectionNames = [
    "Intro",
    "Future Gambling",
    "Betting Markets",
    "Stake & Earn",
    "Security",
    "CTA",
  ];

  return (
    <div className="fixed top-4 right-4 bg-black/70 text-white text-xs px-3 py-2 rounded-md z-[1000]">
      <div className="text-sm font-bold mb-2">Scroll Debug</div>
      <div>Scroll: {(scrollProgress * 100).toFixed(2)}%</div>
      <div>Active: {sectionNames[activeSection]}</div>

      <div className="mt-2 font-semibold">Section Visibility:</div>
      {sectionVisibility.map((isVisible, i) => (
        <div
          key={`section-debug-${i}`}
          className={`flex items-center gap-2 ${
            isVisible ? "text-green-400" : "text-red-400"
          }`}
        >
          {isVisible ? "✓" : "✗"} {sectionNames[i]}
        </div>
      ))}

      <div className="mt-2 border-t border-white/20 pt-1">
        <div className="font-semibold">Thresholds:</div>
        <div
          className={scrollProgress < 0.15 ? "text-green-400" : "text-gray-400"}
        >
          0% - 15%: Intro
        </div>
        <div
          className={
            scrollProgress >= 0.15 && scrollProgress < 0.33
              ? "text-green-400"
              : "text-gray-400"
          }
        >
          15% - 33%: Future Gambling
        </div>
        <div
          className={
            scrollProgress >= 0.33 && scrollProgress < 0.5
              ? "text-green-400"
              : "text-gray-400"
          }
        >
          33% - 50%: Betting Markets
        </div>
        <div
          className={
            scrollProgress >= 0.5 && scrollProgress < 0.67
              ? "text-green-400"
              : "text-gray-400"
          }
        >
          50% - 67%: Stake & Earn
        </div>
        <div
          className={
            scrollProgress >= 0.67 && scrollProgress < 0.85
              ? "text-green-400"
              : "text-gray-400"
          }
        >
          67% - 85%: Security
        </div>
        <div
          className={
            scrollProgress >= 0.85 ? "text-green-400" : "text-gray-400"
          }
        >
          85% - 100%: CTA
        </div>
      </div>
    </div>
  );
}
