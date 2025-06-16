"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Application } from "@splinetool/runtime";
import Spline from "@splinetool/react-spline/next";
import useAudioPlayer from "@/components/hooks/useAudioPlayer";
import useKeyboardNavigation from "@/components/hooks/useKeyboardNavigation";
// import useSectionCentering from "@/components/hooks/useSectionCentering"; // May not be needed if sections are fixed
import useReferralHandling from "@/components/hooks/useReferralHandling";
import MusicToggle from "@/components/MusicToggle";
import LitmexLoader from "@/components/LitmexLoader";
import NavigationHint from "@/components/NavigationHint";
import ContinueButton from "@/components/ContinueButton";
import ReferralIndicator from "@/components/ReferralIndicator";
import { useSession } from "next-auth/react"; // Add this import

// Import section components
import IntroSection from "@/components/sections/IntroSection";
import FutureGamblingSection from "@/components/sections/FutureGamblingSection";
import BettingMarketsSection from "@/components/sections/BettingMarketsSection";
import StakeEarnSection from "@/components/sections/StakeEarnSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";

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
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  // This will store our mapped progress (e.g., 0 to TOTAL_SCROLL_ANIMATION_UNITS)
  const [mappedScrollProgress, setMappedScrollProgress] = useState<number>(0);

  // Handle referral code from URL
  const referralInfo = useReferralHandling();
  const { data: session, status } = useSession(); // Apply referral code if user is authenticated

  useEffect(() => {
    const applyReferralIfAuthenticated = async () => {
      // Check if user is logged in and we have a valid referral code
      if (session?.user && referralInfo.isValid && referralInfo.code) {
        try {
          // Get the user ID from the session - this may be stored differently depending on your auth setup
          const userId = (session.user as any).id || session.user.email;
          if (userId) {
            const applied = await referralInfo.applyReferral(userId);
            if (applied) {
              console.log(
                "Referral automatically applied to authenticated user"
              );
            }
          }
        } catch (error) {
          console.error("Error applying referral automatically:", error);
        }
      }
    };

    applyReferralIfAuthenticated();
  }, [session, referralInfo]);

  // Get scroll progress (0 to 1) for the containerRef
  const { scrollYProgress, scrollY } = useScroll({
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

  // Detect small screens on mount
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Consider tablets and phones as small screens
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Update mappedScrollProgress and control Spline based on scrollYProgress
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // `latest` is a value from 0 to 1
      const currentMappedProgress = latest * TOTAL_SCROLL_ANIMATION_UNITS;
      setMappedScrollProgress(currentMappedProgress);

      // Update Spline animation if app is loaded
      if (splineApp) {
        // Map from 0-1 to 0-MAX_SPLINE_SCROLL_VALUE
        const splineValue = latest * MAX_SPLINE_SCROLL_VALUE;

        // Try common variable names that might control the animation
        const variableNames = [
          "scroll",
          "scrollValue",
          "animation",
          "progress",
          "value",
          "time",
          "position",
        ];

        // Try each variable name until one works
        for (const varName of variableNames) {
          try {
            // splineApp.setVariable(varName, splineValue);
            break; // Exit the loop once we find a working variable
          } catch (error) {
            // Variable doesn't exist, continue to the next one
          }
        }
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, splineApp]);

  const handleSplineLoad = useCallback(
    (app: Application) => {
      setSplineApp(app);
      setIsLoading(false);
      console.log("Spline scene loaded successfully");
      // app.setBackgroundColor("transparent"); // Set background to transparent if needed
      // You might want to set an initial state for the Spline animation here if needed
      // app.setVariable("splineScrollValue", 0);

      // Log referral information if present
      if (referralInfo.code) {
        console.log("Referral detected:", {
          code: referralInfo.code,
          referrerId: referralInfo.referrerId,
          referrerAddress: referralInfo.referrerAddress,
          referrerUsername: referralInfo.referrerUsername,
          isValid: referralInfo.isValid,
        });
      }
    },
    [referralInfo]
  );

  const toggleMusic = useCallback(() => {
    if (musicActive) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play();
    }
    setMusicActive(!musicActive);
  }, [musicActive, backgroundMusic]);

  // Helper function to navigate to a specific section
  const navigateToSection = useCallback(
    (sectionIndex: number) => {
      // Ensure section index is within bounds
      const targetSection = Math.max(0, Math.min(sectionIndex, 5));

      // Calculate target scroll percentage based on section
      let targetScrollPercentage: number;

      if (targetSection === 0) {
        targetScrollPercentage = 0; // Start of the page
      } else {
        // Use the midpoint between section thresholds
        const sectionThresholds = [
          TOTAL_SCROLL_ANIMATION_UNITS * (1 / 6),
          TOTAL_SCROLL_ANIMATION_UNITS * (2 / 6),
          TOTAL_SCROLL_ANIMATION_UNITS * (3 / 6),
          TOTAL_SCROLL_ANIMATION_UNITS * (4 / 6),
          TOTAL_SCROLL_ANIMATION_UNITS * (5 / 6),
        ];

        // Get the target position (add a small offset to make sure we cross the threshold)
        targetScrollPercentage =
          (sectionThresholds[targetSection - 1] + 1) /
          TOTAL_SCROLL_ANIMATION_UNITS;
      }

      // Calculate actual pixel position to scroll to
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const targetScrollPosition = scrollHeight * targetScrollPercentage;

      // Perform the scroll
      window.scrollTo({
        top: targetScrollPosition,
        behavior: "smooth",
      });

      // If we have direct access to the Spline app, update its animation too
      if (splineApp) {
        // Calculate the Spline animation value
        const splineScrollValue =
          targetScrollPercentage * MAX_SPLINE_SCROLL_VALUE;

        // Try common variable names that might control the animation
        const variableNames = [
          "scroll",
          "scrollValue",
          "animation",
          "progress",
          "value",
          "time",
          "position",
        ];

        // Try each variable name until one works
        for (const varName of variableNames) {
          try {
            // splineApp.setVariable(varName, splineScrollValue);
            break; // Exit the loop once we find a working variable
          } catch (error) {
            // Variable doesn't exist, continue to the next one
          }
        }
      }
    },
    [splineApp]
  );

  // Navigation functions for keyboard shortcuts and buttons
  const goToNextSection = useCallback(() => {
    const nextSection = activeSection >= 5 ? 5 : activeSection + 1;
    if (nextSection !== activeSection) {
      navigateToSection(nextSection);
      sectionChangeSound.play();
    }
  }, [activeSection, navigateToSection, sectionChangeSound]);

  const goToPreviousSection = useCallback(() => {
    const prevSection = activeSection <= 0 ? 0 : activeSection - 1;
    if (prevSection !== activeSection) {
      navigateToSection(prevSection);
      sectionChangeSound.play();
    }
  }, [activeSection, navigateToSection, sectionChangeSound]);

  const goToFirstSection = useCallback(() => {
    if (activeSection !== 0) {
      navigateToSection(0);
      sectionChangeSound.play();
    }
  }, [activeSection, navigateToSection, sectionChangeSound]);

  const goToLastSection = useCallback(() => {
    if (activeSection !== 5) {
      navigateToSection(5);
      sectionChangeSound.play();
    }
  }, [activeSection, navigateToSection, sectionChangeSound]);

  // Use the keyboard navigation hook
  useKeyboardNavigation({
    onNext: goToNextSection,
    onPrevious: goToPreviousSection,
    onHome: goToFirstSection,
    onEnd: goToLastSection,
  });

  // Add tap/touch support for small screens
  useEffect(() => {
    // Only enable for small screens
    if (!isSmallScreen) return;

    // Add a tap overlay that spans the screen
    const tapOverlay = document.createElement("div");
    tapOverlay.className =
      "fixed inset-0 z-40 bg-transparent pointer-events-none";

    // Create an interactive button that will handle double taps
    const tapButton = document.createElement("div");
    tapButton.className =
      "fixed bottom-24 right-8 w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto";
    tapButton.innerHTML = `<div class="text-white/70 text-sm">2×</div>`;

    // Add double tap detection
    let lastTap = 0;
    tapButton.addEventListener("touchend", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      // If double tap detected (within 300ms)
      if (tapLength < 300 && tapLength > 0) {
        e.preventDefault();
        goToNextSection();

        // Visual feedback
        tapButton.classList.add("bg-white/30");
        setTimeout(() => tapButton.classList.remove("bg-white/30"), 200);
      }

      lastTap = currentTime;
    });

    // Append to body
    document.body.appendChild(tapOverlay);
    document.body.appendChild(tapButton);

    // Clean up
    return () => {
      document.body.removeChild(tapOverlay);
      document.body.removeChild(tapButton);
    };
  }, [isSmallScreen, goToNextSection]);

  // Show continue button after a period of inactivity
  useEffect(() => {
    // Initialize user activity detection
    let inactivityTimer: NodeJS.Timeout | null = null;
    const INACTIVITY_DELAY = 5000; // 5 seconds of inactivity

    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      setShowContinueButton(false);

      // Set a new timer to show the continue button
      inactivityTimer = setTimeout(() => {
        setShowContinueButton(true);
      }, INACTIVITY_DELAY);
    };

    // Detect user activity
    const activityEvents = [
      "scroll",
      "touchmove",
      "mousemove",
      "keydown",
      "click",
    ];
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Set initial timer
    resetInactivityTimer();

    // Clean up
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  // Watch for section changes based on mappedScrollProgress
  useEffect(() => {
    // Define thresholds based on TOTAL_SCROLL_ANIMATION_UNITS
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

      {/* Referral indicator */}
      {referralInfo.isValid && referralInfo.code && (
        <ReferralIndicator
          referralCode={referralInfo.code}
          referrerUsername={referralInfo.referrerUsername}
        />
      )}

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
          // scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
          onLoad={handleSplineLoad}
          className="w-full h-full"
          onMouseDown={(e) => console.log("Spline mousedown:", e)}
          onScroll={(e) => console.log("Spline scroll:", e)}
          onKeyDown={(e) => console.log("Spline keydown:", e)}
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

      {/* Navigation hint for small screens */}
      <AnimatePresence>
        {isSmallScreen && <NavigationHint isSmallScreen={isSmallScreen} />}
      </AnimatePresence>

      {/* Continue button */}
      <AnimatePresence>
        {showContinueButton && (
          <ContinueButton isVisible={true} onClick={goToNextSection} />
        )}
      </AnimatePresence>

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
