"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Application } from "@splinetool/runtime";
import Spline from "@splinetool/react-spline";
import useAudioPlayer from "@/components/hooks/useAudioPlayer";
import useKeyboardNavigation from "@/components/hooks/useKeyboardNavigation";
import useReferralHandling from "@/components/hooks/useReferralHandling";
import ReferralIndicator from "@/components/ReferralIndicator";
import { useSession } from "next-auth/react";

// Import section components
import IntroSection from "@/components/sections/IntroSection";
import FutureGamblingSection from "@/components/sections/FutureGamblingSection";
import BettingMarketsSection from "@/components/sections/BettingMarketsSection";
import StakeEarnSection from "@/components/sections/StakeEarnSection";
import SecuritySection from "@/components/sections/SecuritySection";
import CtaSection from "@/components/sections/CtaSection";

const TOTAL_SCROLL_ANIMATION_UNITS = 100;
const MAX_SPLINE_SCROLL_VALUE = 1000;

// Device detection utilities
const getDeviceInfo = () => {
  if (typeof window === "undefined")
    return { isIOS: false, isMobile: false, memoryLimited: false };

  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );

  // Detect potentially memory-limited devices
  const memoryLimited =
    isIOS ||
    (typeof (navigator as any).deviceMemory === "number" &&
      (navigator as any).deviceMemory < 4);

  return { isIOS, isMobile, memoryLimited };
};

// WebGL capability detection
const checkWebGLSupport = () => {
  if (typeof window === "undefined") return { webgl: false, webgl2: false };

  try {
    const canvas = document.createElement("canvas");
    const webgl = !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
    const webgl2 = !!canvas.getContext("webgl2");
    return { webgl, webgl2 };
  } catch (e) {
    return { webgl: false, webgl2: false };
  }
};

export default function HomePage() {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [musicActive, setMusicActive] = useState<boolean>(false);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [mappedScrollProgress, setMappedScrollProgress] = useState<number>(0);

  // Device and capability detection
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isMobile: false,
    memoryLimited: false,
  });
  const [webglSupport, setWebglSupport] = useState({
    webgl: false,
    webgl2: false,
  });
  const [splineError, setSplineError] = useState<string | null>(null);
  const [useSplineFallback, setUseSplineFallback] = useState<boolean>(false);

  const referralInfo = useReferralHandling();
  const { data: session, status } = useSession();

  const { scrollYProgress, scrollY } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const sectionChangeSound = useAudioPlayer({
    src: "/sounds/section-change.mp3",
    volume: 0.2,
  });

  // Initialize device detection and WebGL support check
  useEffect(() => {
    const device = getDeviceInfo();
    const webgl = checkWebGLSupport();

    setDeviceInfo(device);
    setWebglSupport(webgl);

    // Pre-emptively use fallback for known problematic scenarios
    // if (!webgl.webgl || (device.isIOS && device.memoryLimited)) {
    //   setUseSplineFallback(true);
    //   setIsLoading(false);
    //   console.log("Using Spline fallback due to device limitations:", {
    //     device,
    //     webgl,
    //   });
    // }

    console.log("Device info:", device);
    console.log("WebGL support:", webgl);
  }, []);

  // Detect small screens and handle resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Enhanced scroll progress handling with error catching
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      try {
        const currentMappedProgress = latest * TOTAL_SCROLL_ANIMATION_UNITS;
        setMappedScrollProgress(currentMappedProgress);
      } catch (error) {
        console.error("Error updating scroll progress:", error);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, splineApp, useSplineFallback]);

  // Enhanced Spline load handler with error recovery
  const handleSplineLoad = useCallback(
    (app: Application) => {
      try {
        setSplineApp(app);
        setIsLoading(false);
        setSplineError(null);
        console.log("Spline scene loaded successfully");

        // Test WebGL context stability on iOS
        if (deviceInfo.isIOS) {
          // Add WebGL context loss listener
          const canvas = document.querySelector("canvas");
          if (canvas) {
            canvas.addEventListener("webglcontextlost", (e) => {
              console.warn("WebGL context lost on iOS");
              e.preventDefault();
              setSplineError("WebGL context lost");
              setUseSplineFallback(true);
            });

            canvas.addEventListener("webglcontextrestored", () => {
              console.log("WebGL context restored");
              setSplineError(null);
            });
          }
        }

        if (referralInfo.code) {
          console.log("Referral detected:", {
            code: referralInfo.code,
            referrerId: referralInfo.referrerId,
            referrerAddress: referralInfo.referrerAddress,
            referrerUsername: referralInfo.referrerUsername,
            isValid: referralInfo.isValid,
          });
        }
      } catch (error) {
        console.error("Error loading Spline:", error);
        setSplineError("Failed to load Spline scene");
        setUseSplineFallback(true);
        setIsLoading(false);
      }
    },
    [referralInfo, deviceInfo.isIOS]
  );

  // Enhanced Spline error handler
  const handleSplineError = useCallback((error: any) => {
    console.error("Spline error:", error);
    setSplineError("Spline failed to load");
    setUseSplineFallback(true);
    setIsLoading(false);
  }, []);

  const navigateToSection = useCallback(
    (sectionIndex: number) => {
      try {
        const targetSection = Math.max(0, Math.min(sectionIndex, 5));
        let targetScrollPercentage: number;

        if (targetSection === 0) {
          targetScrollPercentage = 0;
        } else {
          const sectionThresholds = [
            TOTAL_SCROLL_ANIMATION_UNITS * (1 / 6),
            TOTAL_SCROLL_ANIMATION_UNITS * (2 / 6),
            TOTAL_SCROLL_ANIMATION_UNITS * (3 / 6),
            TOTAL_SCROLL_ANIMATION_UNITS * (4 / 6),
            TOTAL_SCROLL_ANIMATION_UNITS * (5 / 6),
          ];

          targetScrollPercentage =
            (sectionThresholds[targetSection - 1] + 1) /
            TOTAL_SCROLL_ANIMATION_UNITS;
        }

        const scrollHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const targetScrollPosition = scrollHeight * targetScrollPercentage;

        window.scrollTo({
          top: targetScrollPosition,
          behavior: "smooth",
        });
      } catch (error) {
        console.error("Error navigating to section:", error);
      }
    },
    [splineApp, useSplineFallback]
  );

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

  useKeyboardNavigation({
    onNext: goToNextSection,
    onPrevious: goToPreviousSection,
    onHome: goToFirstSection,
    onEnd: goToLastSection,
  });

  // Section change detection
  useEffect(() => {
    const sectionThresholds = [
      TOTAL_SCROLL_ANIMATION_UNITS * (1 / 6),
      TOTAL_SCROLL_ANIMATION_UNITS * (2 / 6),
      TOTAL_SCROLL_ANIMATION_UNITS * (3 / 6),
      TOTAL_SCROLL_ANIMATION_UNITS * (4 / 6),
      TOTAL_SCROLL_ANIMATION_UNITS * (5 / 6),
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

  const sectionVisibility = [
    activeSection === 0,
    activeSection === 1,
    activeSection === 2,
    activeSection === 3,
    activeSection === 4,
    activeSection === 5,
  ];

  // Fallback component for when Spline fails
  const SplineFallback = () => (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        {splineError && (
          <div className="mb-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-sm">3D scene unavailable on this device</p>
            <p className="text-xs text-gray-300 mt-1">
              {deviceInfo.isIOS
                ? "iOS WebGL limitations detected"
                : "WebGL not supported"}
            </p>
          </div>
        )}
        <div className="relative">
          <motion.div
            className="w-32 h-32 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 w-24 h-24 border-2 border-blue-400/30 border-b-blue-400 rounded-full m-auto"
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <p className="text-lg font-semibold">LITMEX</p>
        <p className="text-sm text-gray-300">Enhanced for your device</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Referral indicator */}
      {referralInfo.isValid && referralInfo.code && (
        <ReferralIndicator
          referralCode={referralInfo.code}
          referrerUsername={referralInfo.referrerUsername}
        />
      )}

      {/* Main 3D scene container */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        {useSplineFallback ? (
          <SplineFallback />
        ) : (
          <Spline
            scene="https://prod.spline.design/ypLMYfb0s1KZPBHq/scene.splinecode"
            onLoad={handleSplineLoad}
            onError={handleSplineError}
            className="w-full h-full"
            style={{
              // Optimize for mobile performance
              willChange: deviceInfo.isMobile ? "auto" : "transform",
            }}
            // Reduce quality on memory-limited devices
            renderOnDemand={deviceInfo.memoryLimited}
          />
        )}
      </div>

      {/* Sections container */}
      <div className="fixed inset-0 pointer-events-none z-20">
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

      {/* Scrollable height container */}
      <div style={{ height: "600vh" }} aria-hidden="true"></div>
    </div>
  );
}
