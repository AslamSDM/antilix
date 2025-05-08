"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import SplineSceneWrapper from "./SplineSceneWrapper";
import AnimatedGradientText from "./magic-ui/AnimatedGradientText";
import { RippleButton } from "@/components/magicui/ripple-button";

import { Application } from "@splinetool/runtime";
import { useRouter } from "next/navigation"; // For App Router
import Spline from "@splinetool/react-spline";

// Using a more advanced Spline scene URL for a better experience

const HeroSection: React.FC = () => {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const [isSplineReady, setIsSplineReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const [getStartedClicked, setGetStartedClicked] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<any>(null);
  const router = useRouter();

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
        const events = [
          { event: "buttonClicked", object: "SceneController" },
          { event: "getStarted", object: "ButtonObject" },
          { event: "click", object: "Button" },
          { event: "spin", object: "SplineObject" },
        ];

        // Try each event until one works
        for (const { event, object } of events) {
          try {
            splineRef.current.emitEvent(event, object);
            console.log(`Successfully emitted ${event} to ${object}`);
            break;
          } catch (e) {
            // Continue trying other events
          }
        }
      } catch (error) {
        console.error("Failed to emit event to Spline:", error);
      }
    }

    // Create a ripple animation effect using a timeout
    setTimeout(() => {
      router.push("/about");
    }, 800); // Delay navigation to allow the Spline animation to play
  };

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
      {/* Spline Scene takes full background */}
      <div className="absolute inset-0 z-10">
        <Spline
          scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
          onLoad={handleSplineLoad}
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

        <motion.div variants={itemVariants} className="relative">
          <RippleButton
            // className="px-8 py-4 text-lg font-semibold rounded-lg"
            // rippleColor="rgba(var(--primary-rgb), 0.4)"
            // duration="800ms"
            onClick={handleGetStarted}
          >
            Get Started
          </RippleButton>
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
