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
// import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

import Spline from "@splinetool/react-spline";

// Using a more advanced Spline scene URL for a better experience
const sent =
  " Experience seamless Spline integration with advanced animations and interactive 3D objects. Move your mouse to interact with the scene.";

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

  useEffect(() => {
    // Update scroll position based on scrollYProgress
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setScrollY(latest);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollYProgress]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
      }
    };

    const handleScroll = () => {
      // Get normalized scroll position for the viewport height
      const scrollPosition = window.scrollY;
      const maxScroll = window.innerHeight * 0.8;
      const normalized = Math.min(scrollPosition / maxScroll, 1);
      setScrollY(normalized);
    };

    // Add event listeners
    const currentHeroRef = heroRef.current;
    currentHeroRef?.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      currentHeroRef?.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle Spline load event
  const handleSplineLoad = useCallback((splineApp: Application) => {
    setSplineApp(splineApp);
    splineRef.current = splineApp;
    splineApp.setBackgroundColor(
      themes.theme === "dark" ? "#0C0F0A" : "#e0f7fa"
    );

    setIsSplineReady(true);
    console.log("Spline scene loaded successfully");
  }, []);

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
      {/* Spline Scene takes full background */}
      <div className="absolute inset-0 -z-10">
        {/* <DynamicSpline
          className="bg-black"
          scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
          onLoad={handleSplineLoad}
        /> */}
        <Spline
          scene="https://prod.spline.design/EeG6Jz6Ywyi8BZOJ/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>

      {/* Foreground content - positioned lower with mt-auto and bottom padding */}
      <motion.div
        className=" z-20 flex flex-col items-center text-center max-w-4xl mx-auto mt-40 pb-16 md:pb-24"
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
          <span className="inline-block py-1 px-3 rounded-full text-6xl font-bold bg-secondary/30 text-secondary-foreground backdrop-blur-sm border border-secondary/20">
            Interactive Experience
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-2xl font-bold flex gap-1 flex-wrap md:text-xl max-w-2xl mb-8 text-foreground drop-shadow-md dark:text-foreground/90 dark:text-shadow-sm"
          style={{
            opacity: scrollY > 0.19 ? 0 : 1,
          }}
        >
          {/* {sent.split(" ").map((word, index) => {

            return (
              <motion.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                ref={index === 0 ? sentRef : undefined}
                style={{
                  opacity:
                    scrollY < 0.1
                      ? 0
                      : scrollY > 0.5
                      ? 1
                      : (scrollY - 0.1) / 0.4,
                  transform: `translateY(${20 - scrollY * 20}px)`,
                  transition: "opacity 0.3s, transform 0.3s",
                  display: "inline-block",
                }}
              >
                {word}{" "}
              </motion.span>
            );
          })} */}
          {sent}
        </motion.h1>
        <Button>
          <RippleButton
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={handleGetStarted}
            disabled={getStartedClicked}
          >
            Get Started
          </RippleButton>
        </Button>

        {/* Scroll indicator removed */}
      </motion.div>
    </section>
  );
};

export default HeroSection;
