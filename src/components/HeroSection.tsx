"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SplineSceneWrapper from "./SplineSceneWrapper";
import ShimmerButton from "./magic-ui/ShimmerButton"; // Using Magic UI button
import AnimatedGradientText from "./magic-ui/AnimatedGradientText";
import { Application } from "@splinetool/runtime";
import { useRouter } from "next/navigation"; // For App Router

// Using a more advanced Spline scene URL for a better experience
const SPLINE_SCENE_URL_HERO =
  "https://prod.spline.design/QUz7nubEnjtuGfIk/scene.splinecode";

const HeroSection: React.FC = () => {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const [isSplineReady, setIsSplineReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const [getStartedClicked, setGetStartedClicked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSplineLoad = useCallback((app: Application) => {
    setSplineApp(app);
    setIsSplineReady(true);
    console.log("Hero Spline Scene Loaded and Ready.");
    // Initialize any Spline animations or states here
    setTimeout(() => {
      if (app) {
        try {
          // Trigger an initial animation in Spline
          app.emitEvent("onSceneLoaded" as any, "SceneController");
        } catch (error) {
          console.error("Error triggering initial animation:", error);
        }
      }
    }, 500);
  }, []);

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

  const handleGetStarted = () => {
    console.log("Get Started button clicked in HeroSection");
    setGetStartedClicked(true);

    // Create a ripple animation effect using a timeout
    setTimeout(() => {
      router.push("/about");
    }, 800); // Delay navigation to allow the Spline animation to play
  };

  const resetGetStartedTrigger = useCallback(() => {
    setGetStartedClicked(false);
  }, []);

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Background animation elements
  const backgroundElements = Array(5)
    .fill(0)
    .map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-3xl"
        style={{
          width: `${Math.random() * 200 + 100}px`,
          height: `${Math.random() * 200 + 100}px`,
          top: `${Math.random() * 80}%`,
          left: `${Math.random() * 80}%`,
          zIndex: 1,
        }}
        animate={{
          x: [0, Math.random() * 60 - 30],
          y: [0, Math.random() * 60 - 30],
          scale: [1, Math.random() * 0.3 + 0.8, 1],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    ));

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background text-foreground p-4 md:p-8"
    >
      {/* Animated background elements */}
      {backgroundElements}

      {/* Spline Scene takes full background */}
      <div className="absolute inset-0 z-10">
        <SplineSceneWrapper
          splineSceneUrl={SPLINE_SCENE_URL_HERO}
          onSplineLoad={handleSplineLoad}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
          scrollProgress={scrollY}
          getStartedClicked={getStartedClicked}
          resetGetStarted={resetGetStartedTrigger}
          className="opacity-80 dark:opacity-60" // Slightly increased opacity
        />
      </div>

      {/* Foreground content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isSplineReady ? "visible" : "hidden"} // Animate text when Spline is ready
      >
        <motion.div variants={itemVariants} className="mb-2">
          <span className="inline-block py-1 px-3 rounded-full text-sm font-medium bg-secondary/30 text-secondary-foreground backdrop-blur-sm">
            Interactive Experience
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
        >
          <AnimatedGradientText
            duration={5}
            fromColor="hsl(var(--primary))"
            toColor="hsl(var(--accent))"
          >
            Dimension Next
          </AnimatedGradientText>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl max-w-2xl mb-8 text-foreground/80"
        >
          Experience seamless Spline integration with advanced animations and
          interactive 3D objects. Move your mouse to interact with the scene.
        </motion.p>

        <motion.div variants={itemVariants}>
          <ShimmerButton
            className="px-8 py-4 text-lg rounded-lg font-semibold"
            onClick={handleGetStarted}
            shimmerColor="rgba(255,255,255,0.5)"
          >
            Get Started
          </ShimmerButton>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-foreground/60 rounded-full"
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <p className="text-xs mt-2 text-muted-foreground">
            Scroll to explore
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
