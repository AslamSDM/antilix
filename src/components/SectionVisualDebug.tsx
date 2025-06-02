"use client";

import React from "react";

interface SectionVisualDebugProps {
  scrollProgress: number;
  activeSection: number;
}

export default function SectionVisualDebug({
  scrollProgress,
  activeSection,
}: SectionVisualDebugProps) {
  const sectionNames = [
    "Intro",
    "Future Gambling",
    "Betting Markets",
    "Stake & Earn",
    "Security",
    "CTA",
  ];

  const sectionColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-red-500",
  ];

  return (
    <div className="fixed right-4 bottom-4 bg-black/70 text-white text-xs px-2 py-1 rounded-md z-[1000]">
      <div className="text-xs font-bold mb-1">Layout Debug</div>

      {/* Section names with current highlighted */}
      <div className="grid grid-cols-1 gap-1 mb-1">
        {sectionNames.map((name, i) => (
          <div
            key={`section-name-${i}`}
            className={`px-1 rounded ${
              activeSection === i ? "bg-primary text-black" : ""
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Visual scroll bar */}
      <div className="w-full h-4 bg-gray-800 rounded relative mb-1">
        <div
          className={`h-full rounded ${sectionColors[activeSection]}`}
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>
        {/* Section markers */}
        <div
          className="absolute top-0 left-[16%] h-full border-l border-white/50"
          style={{ left: "16%" }}
        ></div>
        <div
          className="absolute top-0 left-[33%] h-full border-l border-white/50"
          style={{ left: "33%" }}
        ></div>
        <div
          className="absolute top-0 left-[50%] h-full border-l border-white/50"
          style={{ left: "50%" }}
        ></div>
        <div
          className="absolute top-0 left-[67%] h-full border-l border-white/50"
          style={{ left: "67%" }}
        ></div>
        <div
          className="absolute top-0 left-[85%] h-full border-l border-white/50"
          style={{ left: "85%" }}
        ></div>
      </div>

      <div className="flex justify-between text-[10px]">
        <span>0%</span>
        <span>16%</span>
        <span>33%</span>
        <span>50%</span>
        <span>67%</span>
        <span>85%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
