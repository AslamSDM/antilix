"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Application } from "@splinetool/runtime";
import Spline, { SplineEvent } from "@splinetool/react-spline";
import useAudioPlayer from "@/components/hooks/useAudioPlayer";
// import useSectionCentering from "@/components/hooks/useSectionCentering"; // May not be needed if sections are fixed
import MusicToggle from "@/components/MusicToggle";
import LitmexLoader from "@/components/LitmexLoader";

// Import section components
import IntroSection from "@/components/sections/IntroSection";
import FutureGamblingSection from "@/components/sections/FutureGamblingSection";
import BettingMarketsSection from "@/components/sections/BettingMarketsSection";
import StakeEarnSection from "@/components/sections/StakeEarnSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";

// Define the total "units" your animation and sections will span across.
// This is arbitrary but helps map the 0-1 scrollYProgress to a more granular scale.
const TOTAL_SCROLL_ANIMATION_UNITS = 100; // e.g., sections change every 20 units

// Define the maximum value Spline's scroll animation expects.
// This MUST match what you've configured in your Spline scene's scroll event.
// For example, if your Spline animation plays fully when a scroll variable goes from 0 to 1000.
const MAX_SPLINE_SCROLL_VALUE = 1000; // Adjust this based on your Spline setup!

export default function HomePage() {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [musicActive, setMusicActive] = useState<boolean>(false);
  // This will store our mapped progress (e.g., 0 to TOTAL_SCROLL_ANIMATION_UNITS)
  const [mappedScrollProgress, setMappedScrollProgress] = useState<number>(0);

  // Get scroll progress (0 to 1) for the containerRef
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"], // Scroll from the very start to the very end of containerRef
  });

  const sectionChangeSound = useAudioPlayer({
    src: "/sounds/section-change.mp3",
    volume: 0.2,
  });

  const backgroundMusic = useAudioPlayer({
    src: "/sounds/background-ambience.mp3",
    volume: 0.15,
    playOnMount: false,
  });

  // Update mappedScrollProgress and control Spline based on scrollYProgress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // `latest` is a value from 0 to 1
      const currentMappedProgress = latest * TOTAL_SCROLL_ANIMATION_UNITS;
      setMappedScrollProgress(currentMappedProgress);
    });
    return () => unsubscribe();
  }, [scrollYProgress, splineApp]);

  const handleSplineLoad = useCallback((app: Application) => {
    setSplineApp(app);
    setIsLoading(false);
    console.log("Spline scene loaded successfully");
    app.setBackgroundColor("transparent"); // Set background to transparent if needed
    // You might want to set an initial state for the Spline animation here if needed
    // app.setVariable("splineScrollValue", 0);
  }, []);

  const toggleMusic = useCallback(() => {
    if (musicActive) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play();
    }
    setMusicActive(!musicActive);
  }, [musicActive, backgroundMusic]);

  // Watch for section changes based on mappedScrollProgress
  useEffect(() => {
    // Define thresholds based on TOTAL_SCROLL_ANIMATION_UNITS
    // For example, if TOTAL_SCROLL_ANIMATION_UNITS is 100:
    // Section 0: 0-19.99
    // Section 1: 20-39.99
    // ...
    // Section 5: 100+ (or 80-100 if it's the last one before end)
    const sectionThresholds = [
      TOTAL_SCROLL_ANIMATION_UNITS * (1 / 6), // approx 16.66 for 100 units
      TOTAL_SCROLL_ANIMATION_UNITS * (2 / 6), // approx 33.33
      TOTAL_SCROLL_ANIMATION_UNITS * (3 / 6), // approx 50
      TOTAL_SCROLL_ANIMATION_UNITS * (4 / 6), // approx 66.66
      TOTAL_SCROLL_ANIMATION_UNITS * (5 / 6), // approx 83.33
    ];

    let newSection;
    if (mappedScrollProgress < sectionThresholds[0]) {
      newSection = 0;
    } else if (mappedScrollProgress < sectionThresholds[1]) {
      newSection = 1;
    } else if (mappedScrollProgress < sectionThresholds[2]) {
      newSection = 2;
    } else if (mappedScrollProgress < sectionThresholds[3]) {
      newSection = 3;
    } else if (mappedScrollProgress < sectionThresholds[4]) {
      newSection = 4;
    } else {
      newSection = 5;
    }

    if (newSection !== activeSection) {
      setActiveSection(newSection);
      sectionChangeSound.play();
      console.log(
        `Section changed to: ${newSection}, at mapped progress: ${mappedScrollProgress.toFixed(
          2
        )}`
      );
    }
  }, [mappedScrollProgress, activeSection, sectionChangeSound]);

  // Define section visibility based on activeSection
  const sectionVisibility = [
    activeSection === 0,
    activeSection === 1,
    activeSection === 2,
    activeSection === 3,
    activeSection === 4,
    activeSection === 5,
  ];
  console.log("Section visibility:", scrollYProgress);
  // useSectionCentering(); // This might not be needed if sections are fixed centrally

  return (
    // This containerRef needs to have a defined height for scrollYProgress to work against.
    // The artificial scroll height will be created *inside* it.
    <div
      ref={containerRef}
      className="relative w-full" // Removed flex, items-center, justify-center if content is fixed
      // It needs to be scrollable, so its height matters.
    >
      {/* Background music toggle - position it as needed */}
      <MusicToggle isPlaying={musicActive} onToggle={toggleMusic} />

      {/* Loading screen */}
      <AnimatePresence mode="wait">
        {isLoading && <LitmexLoader isLoading={isLoading} />}
      </AnimatePresence>

      {/* Sticky Spline container - z-index adjusted to be behind text sections but above background */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        <Spline
          scene="https://prod.spline.design/ypLMYfb0s1KZPBHq/scene.splinecode"
          onLoad={handleSplineLoad}
          className="w-full h-full"
          // onSplineScroll is not needed if we drive it via setVariable
        />

        {/* Scroll hint that fades out as user starts scrolling */}
        {activeSection === 0 && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: mappedScrollProgress < 5 ? 1 : 0,
              y: mappedScrollProgress < 5 ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="mb-2"
            >
              <svg
                width="24"
                height="24"
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
            <span className="text-sm">Scroll to explore</span>
          </motion.div>
        )}
      </div>

      {/* Sections container - we no longer need to center it since each section has absolute positioning */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {/* Each section will control its own pointer-events and positioning */}
        <AnimatePresence mode="wait">
          {sectionVisibility[0] && (
            <IntroSection isVisible={true} key="intro" />
          )}
          {sectionVisibility[1] && (
            <FutureGamblingSection isVisible={true} key="future" />
          )}
          {sectionVisibility[2] && (
            <BettingMarketsSection isVisible={true} key="markets" />
          )}
          {sectionVisibility[3] && (
            <StakeEarnSection isVisible={true} key="stake" />
          )}
          {sectionVisibility[4] && (
            <SecuritySection isVisible={true} key="security" />
          )}
          {sectionVisibility[5] && <CtaSection isVisible={true} key="cta" />}
        </AnimatePresence>
      </div>

      {/* ---- THE KEY TO INCREASE SCROLL ---- */}
      {/* This div creates the scrollable height. Adjust height as needed. */}
      {/* 500vh means 5 screen heights of scrolling. */}
      {/* This MUST be a direct child of the `containerRef` element if `offset` is `start start, end end` */}
      {/* Or, ensure `containerRef` itself has this height or contains elements that sum up to it. */}
      <div style={{ height: "600vh" }} aria-hidden="true"></div>
      {/* The height (e.g., 600vh) determines how much physical scroll distance maps to the 0-1 scrollYProgress.
          A larger vh value means you have to scroll more for the animation to progress.
          This needs to "feel right" with your TOTAL_SCROLL_ANIMATION_UNITS and MAX_SPLINE_SCROLL_VALUE.
      */}
    </div>
  );
}
