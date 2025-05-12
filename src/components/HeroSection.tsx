"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { motion, useScroll } from "framer-motion";
import { RippleButton } from "@/components/magicui/ripple-button"; // Using Magic UI ripple button
import { Application } from "@splinetool/runtime";
import { useRouter } from "next/navigation"; // For App Router
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

// Lazy load Spline component using React.lazy instead of Next.js dynamic import
const DynamicSpline = React.lazy(() => import("@splinetool/react-spline"));

// Fallback component for when Spline is loading
const SplineLoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Text content for the hero section
const heroTitle = "Quantum-Proof Blockchain";
const heroDescription =
  "Quranium is the uncrackable foundation for the digital era. Our advanced Layer 1 DLT provides unprecedented security against both classical and quantum computing attacks.";

// Hook to detect screen size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
};

const HeroSection: React.FC = () => {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const [isSplineReady, setIsSplineReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const [getStartedClicked, setGetStartedClicked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<any>(null);
  const sentRef = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: sentRef,
    offset: ["start 0.5", "end 0.5"],
  });
  const themes = useTheme();
  const windowSize = useWindowSize();

  // Determine if screen is small
  const isSmallScreen = windowSize.width < 768;

  useEffect(() => {
    // Update scroll position based on scrollYProgress
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setScrollY(latest);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollYProgress]);

  // Handle Spline load event
  const handleSplineLoad = useCallback(
    (splineApp: Application) => {
      setSplineApp(splineApp);
      splineRef.current = splineApp;

      // Adjust the scene based on screen size
      if (splineApp) {
        // Set background color based on theme - dark blue/purple theme for blockchain visualization
        splineApp.setBackgroundColor(
          themes.theme === "dark" ? "#090A1A" : "#F0F4FF"
        );

        // For small screens, adjust camera or scale
      }

      setIsSplineReady(true);
    },
    [themes.theme, isSmallScreen]
  );

  useEffect(() => {
    if (splineRef.current) {
      splineRef.current.setBackgroundColor(
        themes.theme === "dark" ? "#090A1A" : "#F0F4FF"
      );
    }
  }, [themes.theme]);

  // Effect to adjust Spline when window size changes
  useEffect(() => {
    if (splineRef.current) {
      try {
        // Set background based on theme
        splineRef.current.setBackgroundColor(
          themes.theme === "dark" ? "#090A1A" : "#F0F4FF"
        );

        // Adjust for small screens whenever window size changes
        const camera = splineRef.current.findObjectByName("Camera");
        const mainScene =
          splineRef.current.findObjectByName("MainScene") ||
          splineRef.current.findObjectByName("Scene") ||
          splineRef.current.findObjectByType("Scene");

        if (isSmallScreen && camera) {
          // Adjust camera for small screens
          camera.position.z =
            camera.position.z > 5 ? camera.position.z : camera.position.z + 1.5;
          if (camera.fov) {
            camera.fov = Math.min(camera.fov * 1.2, 75);
            camera.updateProjectionMatrix?.();
          }
        } else if (camera) {
          // Reset camera for larger screens
          camera.position.z = Math.max(
            camera.position.z - 1.5,
            camera._originalPosition?.z || camera.position.z
          );
          if (camera.fov && camera._originalFov) {
            camera.fov = camera._originalFov;
            camera.updateProjectionMatrix?.();
          }
        }

        // Scale adjustment based on screen size
        if (mainScene) {
          const scale = isSmallScreen ? 0.85 : 1.0;
          mainScene.scale.set(scale, scale, scale);
        }
      } catch (error) {
        console.log("Error adjusting Spline on resize:", error);
      }
    }
  }, [windowSize.width, themes.theme, isSmallScreen]);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: scrollY > 0.21 ? 0 : 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: scrollY > 0.21 ? 0 : 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Particle effect for the blockchain theme
  const BlockchainParticles = () => (
    <div className="absolute inset-0 z-0">
      <div className="absolute w-full h-full opacity-20 mix-blend-screen">
        <div className="absolute h-2 w-2 rounded-full bg-primary top-1/4 left-1/4 animate-pulse"></div>
        <div className="absolute h-3 w-3 rounded-full bg-secondary top-1/3 left-1/2 animate-pulse animation-delay-700"></div>
        <div className="absolute h-2 w-2 rounded-full bg-primary top-1/2 left-1/3 animate-pulse animation-delay-500"></div>
        <div className="absolute h-2 w-2 rounded-full bg-primary top-2/3 left-3/4 animate-pulse animation-delay-300"></div>
        <div className="absolute h-3 w-3 rounded-full bg-secondary top-3/4 left-1/4 animate-pulse animation-delay-1000"></div>
      </div>
    </div>
  );

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground p-4 md:p-8 sticky top-0 z-[-10]"
    >
      {/* <BlockchainParticles /> */}

      {/* Spline Scene takes full background with responsive adjustments */}
      <div
        className={`absolute inset-0 -z-10 flex items-center justify-center w-full h-full ${
          isSmallScreen ? "scale-[1.15] translate-y-10" : ""
        }`}
        style={{
          left: "50%",
          transform: `translateX(-50%) ${
            isSmallScreen ? "scale(1.15) translateY(10px)" : ""
          }`,
        }}
      >
        <Suspense fallback={<SplineLoadingFallback />}>
          <DynamicSpline
            // scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
            scene="https://prod.spline.design/TzS95U5C42rKjFN4/scene.splinecode"
            onLoad={handleSplineLoad}
          />
        </Suspense>
      </div>
      <motion.div
        className={`z-[-10]flex flex-col items-center text-center max-w-4xl mx-auto ${
          isSmallScreen ? "mt-24 pb-12" : "mt-40 pb-16 md:pb-24"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate={isSplineReady ? "visible" : "hidden"} // Animate text when Spline is ready
      >
        <motion.div
          variants={itemVariants}
          className="mb-4 -mt-10`"
          style={{
            opacity: scrollY > 0.19 ? 0 : 1,
          }}
        >
          <span
            className={`inline-block py-1 px-3 rounded-full ${
              isSmallScreen ? "text-4xl" : "text-6xl"
            } font-bold bg-secondary/30 text-secondary-foreground backdrop-blur-sm border border-secondary/20 `}
          >
            {heroTitle}
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className={`${
            isSmallScreen ? "text-lg" : "text-2xl md:text-xl"
          } font-bold flex flex-wrap max-w-2xl mb-8 text-foreground drop-shadow-md dark:text-foreground/90 dark:text-shadow-sm `}
          style={{
            opacity: scrollY > 0.19 ? 0 : 1,
          }}
        >
          <span ref={sentRef}>{heroDescription}</span>
        </motion.h1>

        {/* <motion.div variants={itemVariants}>
          <Button>
            <RippleButton
              className="bg-primary text-primary-foreground hover:bg-primary/90 transitioœn-colors"
              onClick={handleExplore}
              disabled={getStartedClicked}
            >
              Explore Quranium
            </RippleButton>
          </Button>
        </motion.div> */}

        {/* Security badges */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 -mt-1"
          style={{ opacity: scrollY > 0.19 ? 0 : 1 }}
        >
          <div className="flex items-center bg-background/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            <span className="text-xs font-medium">Quantum-Resistant</span>
          </div>
          <div className="flex items-center bg-background/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-xs font-medium">Energy Efficient</span>
          </div>
          <div className="flex items-center bg-background/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            <span className="text-xs font-medium">Layer 1 DLT</span>
          </div>
        </motion.div>
      </motion.div>
      {/* Foreground content - position adjusted for small screens */}
    </section>
  );
};

export default HeroSection;
