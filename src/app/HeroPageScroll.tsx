"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Spline from "@splinetool/react-spline/next";
import { Application } from "@splinetool/runtime";
import { motion, useScroll, useTransform } from "framer-motion";
import { HyperText } from "@/components/magicui/hyper-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { SpinningText } from "@/components/magicui/spinning-text";
import { LineShadowText } from "@/components/magicui/line-shadow-text";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const HeroPageScroll: React.FC = () => {
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<any>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Transform values for different elements based on scroll position
  const opacityHeader = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const opacityTagline = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);
  const opacityTaglineEnd = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);
  const opacityFeatures = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);
  const opacityFeaturesEnd = useTransform(scrollYProgress, [0.8, 0.9], [1, 0]);
  const opacityCTA = useTransform(scrollYProgress, [0.8, 1.0], [0, 1]);

  // Left and right positions for side text
  const leftPosition = useTransform(
    scrollYProgress,
    [0.3, 0.4],
    ["-100%", "0%"]
  );
  const rightPosition = useTransform(
    scrollYProgress,
    [0.3, 0.4],
    ["100%", "0%"]
  );
  const bottomPosition = useTransform(
    scrollYProgress,
    [0.6, 0.7],
    ["100%", "0%"]
  );

  const handleSplineLoad = useCallback((splineApp: Application) => {
    setSplineApp(splineApp);
    splineRef.current = splineApp;

    // You can manipulate the Spline scene here if needed
    // For example, attaching animations to scroll events
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Sticky Spline container that stays in view while scrolling */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 bg-black">
        <Spline
          scene="https://prod.spline.design/3ETSH65uhct2x1US/scene.splinecode"
          onLoad={handleSplineLoad}
          className="w-full h-full"
        />
      </div>

      {/* Scroll content container - this creates the height needed for scrolling */}
      <div className="relative z-10 w-full h-[500vh]">
        {/* Section 1: Hero Title - Visible at the start */}
        <div className="absolute top-[10vh] inset-x-0 text-center">
          <motion.div style={{ opacity: opacityHeader }} className="px-4">
            <HyperText
              className="text-5xl md:text-7xl font-bold text-white font-display"
              duration={1500}
              startOnView={true}
              animateOnHover={true}
            >
              Litmex
            </HyperText>
            <motion.p
              className="mt-6 text-xl md:text-2xl text-white/80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Premium Web3 Gaming Experience
            </motion.p>
          </motion.div>
        </div>

        {/* Section 2: Side Taglines - Appear as you scroll */}
        <motion.div
          style={{
            opacity: opacityTagline,
            x: leftPosition,
          }}
          className="absolute top-[35vh] left-10 max-w-xs"
        >
          <TextAnimate className="text-xl md:text-2xl text-white font-bold">
            Provably Fair Games
          </TextAnimate>
          <p className="text-white/70 mt-2">
            All games are verified on-chain with transparent algorithms
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: opacityTagline,
            x: rightPosition,
          }}
          className="absolute top-[35vh] right-10 max-w-xs text-right"
        >
          <SpinningText className="text-xl md:text-2xl text-white font-bold inline-block">
            Blockchain Security
          </SpinningText>
          <p className="text-white/70 mt-2">
            Built on state-of-the-art blockchain technology
          </p>
        </motion.div>

        <motion.div
          style={{
            opacity: opacityTaglineEnd,
            y: bottomPosition,
          }}
          className="absolute top-[60vh] left-1/2 transform -translate-x-1/2 text-center"
        >
          <LineShadowText className="text-3xl md:text-4xl text-white font-bold">
            The Future of Gaming
          </LineShadowText>
        </motion.div>

        {/* Section 3: Features - Appear as you continue scrolling */}
        <motion.div
          style={{ opacity: opacityFeatures }}
          className="absolute top-[120vh] left-10 max-w-sm"
        >
          {/* <TypingAnimation
            className="text-xl md:text-2xl text-white font-bold"
            text={["Exclusive VIP Rewards", 1000]}
            repeat={0}
          /> */}
          <ul className="mt-4 space-y-2 text-white/80">
            <li>• Special bonuses and early access</li>
            <li>• Priority support and services</li>
            <li>• Unique collectible NFTs</li>
          </ul>
        </motion.div>

        <motion.div
          style={{ opacity: opacityFeatures }}
          className="absolute top-[120vh] right-10 max-w-sm text-right"
        >
          <TextAnimate className="text-xl md:text-2xl text-white font-bold">
            Luxury Gaming Platform
          </TextAnimate>
          <p className="mt-4 text-white/80">
            Our platform offers unparalleled transparency, fairness, and
            excitement for sophisticated players who demand the best.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: opacityFeaturesEnd }}
          className="absolute top-[180vh] inset-x-0 text-center"
        >
          <HyperText
            className="text-3xl md:text-5xl font-bold text-white font-display"
            duration={1200}
            startOnView={true}
          >
            Join the Elite
          </HyperText>
        </motion.div>

        {/* Section 4: Call to Action - Appears at the end of scroll */}
        <motion.div
          style={{ opacity: opacityCTA }}
          className="absolute top-[250vh] inset-x-0 text-center"
        >
          <div className="max-w-xl mx-auto px-4">
            <LineShadowText className="text-3xl md:text-4xl text-white font-bold mb-8">
              Join Litmex Presale
            </LineShadowText>

            <p className="text-white/80 text-lg mb-8">
              Secure your position in the future of premium web3 gaming. Early
              investors gain exclusive benefits and priority access.
            </p>

            <Link href="/presale" className="inline-block">
              <RainbowButton className="px-8 py-4 text-lg">
                <span className="mr-2">Join Presale Now</span>
                <ChevronRight className="w-5 h-5" />
              </RainbowButton>
            </Link>

            <p className="text-sm text-white/60 mt-6">
              Limited allocation available • Presale ends June 15, 2025
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroPageScroll;
