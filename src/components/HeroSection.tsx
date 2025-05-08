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

// Dynamically import Spline component to reduce initial bundle size
const DynamicSpline = React.lazy(() => import("@splinetool/react-spline"));

// Using a more advanced Spline scene URL for a better experience
const sent =
  " Experience seamless Spline integration with advanced animations and interactive 3D objects. Move your mouse to interact with the scene.";

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

  // useEffect(() => {
  //   const handleMouseMove = (event: MouseEvent) => {
  //     if (heroRef.current) {
  //       const rect = heroRef.current.getBoundingClientRect();
  //       const x = (event.clientX - rect.left) / rect.width;
  //       const y = (event.clientY - rect.top) / rect.height;
  //       setMousePos({ x, y });
  //     }
  //   };

  //   const handleScroll = () => {
  //     // Get normalized scroll position for the viewport height
  //     const scrollPosition = window.scrollY;
  //     const maxScroll = window.innerHeight * 0.8;
  //     const normalized = Math.min(scrollPosition / maxScroll, 1);
  //     setScrollY(normalized);
  //   };

  //   // Add event listeners
  //   const currentHeroRef = heroRef.current;
  //   currentHeroRef?.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("scroll", handleScroll);

  //   return () => {
  //     currentHeroRef?.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

  // Handle Spline load event
  const handleSplineLoad = useCallback(
    (splineApp: Application) => {
      setSplineApp(splineApp);
      splineRef.current = splineApp;

      // Adjust the scene based on screen size
      if (splineApp) {
        // Set background color based on theme
        splineApp.setBackgroundColor(
          themes.theme === "dark" ? "#0C0F0A" : "#e0f7fa"
        );

        // For small screens, adjust camera or scale
        // if (isSmallScreen) {
        //   try {
        //     // Try to adjust the camera position for better viewing on small screens
        //     const camera = splineApp.findObjectByName("Camera");
        //     if (camera) {
        //       // Move camera back to show more of the scene
        //       camera.position.z += 1.5;

        //       // Adjust field of view if available
        //       if (camera.fov) {
        //         camera.fov = Math.min(camera.fov * 1.2, 75); // Increase FOV slightly but cap it
        //         camera.updateProjectionMatrix?.();
        //       }
        //     }

        //     // Or scale the main scene container if camera adjustment isn't possible
        //     const mainScene =
        //       splineApp.findObjectByName("MainScene") ||
        //       splineApp.findObjectByName("Scene") ||
        //       splineApp.findObjectByType("Scene");

        //     if (mainScene) {
        //       // Scale down the scene for small screens
        //       mainScene.scale.set(0.85, 0.85, 0.85);
        //     }
        //   } catch (error) {
        //     console.error("Error adjusting Spline for small screens:", error);
        //   }
        // }
      }

      setIsSplineReady(true);
      console.log("Spline scene loaded successfully");
    },
    [themes.theme, isSmallScreen]
  );

  const handleGetStarted = (e: React.MouseEvent) => {
    console.log("Get Started button clicked in HeroSection");

    setGetStartedClicked(true);

    // Try to trigger animation in Spline object
    if (splineRef.current) {
      try {
        // Try different events that might be set up in your Spline scene
        // Try different rotation events
        splineRef.current.emitEvent("rotate", "start");
        splineRef.current.emitEvent("spin");
        splineRef.current.emitEvent("mousehover");

        // Apply direct rotation manipulation if possible
        const targetObject = splineRef.current.findObjectByName("MainObject");
        if (targetObject) {
          targetObject.rotation.y += Math.PI; // 180-degree rotation
          targetObject.rotation.x += Math.PI / 4; // 45-degree tilt
        }

        // Alternatively try animation sequence
        splineRef.current.emitEventReverse("rotate");
      } catch (error) {
        console.error("Failed to emit event to Spline:", error);
      }
    }

    // Create a ripple animation effect using a timeout
    setTimeout(() => {
      router.push("/about");
    }, 800); // Delay navigation to allow the Spline animation to play
  };
  useEffect(() => {
    if (splineRef.current) {
      splineRef.current.setBackgroundColor(
        themes.theme === "dark" ? "#0C0F0A" : "#e0f7fa"
      );
    }
  }, [themes.theme]);

  // Effect to adjust Spline when window size changes
  useEffect(() => {
    if (splineRef.current) {
      try {
        // Set background based on theme
        splineRef.current.setBackgroundColor(
          themes.theme === "dark" ? "#0C0F0A" : "#e0f7fa"
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

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground p-4 md:p-8 sticky top-0 z-[-10]"
    >
      {/* Spline Scene takes full background with responsive adjustments */}
      <div
        className={`absolute inset-0 -z-10 ${
          isSmallScreen ? "scale-[1.15] translate-y-10" : ""
        }`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <DynamicSpline
            className="bg-black"
            scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
            onLoad={handleSplineLoad}
          />
        </Suspense>
      </div>

      {/* Foreground content - position adjusted for small screens */}
      <motion.div
        className={`z-20 flex flex-col items-center text-center max-w-4xl mx-auto ${
          isSmallScreen ? "mt-24 pb-12" : "mt-40 pb-16 md:pb-24"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate={isSplineReady ? "visible" : "hidden"} // Animate text when Spline is ready
      >
        <motion.div
          variants={itemVariants}
          className="mb-2"
          style={{
            opacity: scrollY > 0.19 ? 0 : 1,
          }}
        >
          <span
            className={`inline-block py-1 px-3 rounded-full ${
              isSmallScreen ? "text-4xl" : "text-6xl"
            } font-bold bg-secondary/30 text-secondary-foreground backdrop-blur-sm border border-secondary/20`}
          >
            Interactive Experience
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className={`${
            isSmallScreen ? "text-lg" : "text-2xl md:text-xl"
          } font-bold flex gap-1 flex-wrap max-w-2xl mb-8 text-foreground drop-shadow-md dark:text-foreground/90 dark:text-shadow-sm`}
          style={{
            opacity: scrollY > 0.19 ? 0 : 1,
          }}
        >
          {sent}
        </motion.h1>
        <RippleButton
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={handleGetStarted}
          disabled={getStartedClicked}
        >
          Get Started
        </RippleButton>
      </motion.div>
    </section>
  );
};

export default HeroSection;
