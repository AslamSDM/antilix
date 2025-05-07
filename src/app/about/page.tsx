"use client"; // Keep client component for potential Spline interactions
import React, { useEffect, useState } from "react";
import SplineSceneWrapper from "@/components/SplineSceneWrapper";
import AnimatedGradientText from "@/components/magic-ui/AnimatedGradientText";
import { motion } from "framer-motion";
import ShimmerButton from "@/components/magic-ui/ShimmerButton";
import { useRouter } from "next/navigation";

// Using a different Spline scene URL for About page
const SPLINE_SCENE_URL_ABOUT =
  "https://prod.spline.design/EeG6Jz6Ywyi8BZOJ/scene.splinecode";

const AboutPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSplineReady, setIsSplineReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSplineLoad = (splineApp: any) => {
    setIsSplineReady(true);
    console.log("About page Spline scene loaded");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="container mx-auto min-h-[calc(100vh-var(--header-height,10rem))] py-12 px-4 md:px-8 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }} // Delay slightly after page transition
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <AnimatedGradientText>About Dimension Next</AnimatedGradientText>
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-muted-foreground">
          We are exploring the future of web interactions by blending 3D
          graphics with modern UI frameworks. This page demonstrates navigation
          and how a Spline scene might be reset or transitioned for a new
          context.
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-2xl h-[400px] md:h-[500px] rounded-xl shadow-2xl overflow-hidden bg-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SplineSceneWrapper
          splineSceneUrl={SPLINE_SCENE_URL_ABOUT}
          isMobileLayout={isMobile}
          onSplineLoad={handleSplineLoad}
          // Pass a different initial state
          scrollProgress={0.5} // Start at halfway point in animation
        />
      </motion.div>

      <motion.div
        className="mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <ShimmerButton
          onClick={handleGoHome}
          className="px-6 py-3 rounded-lg font-medium"
        >
          Return to Home
        </ShimmerButton>
        <p className="text-xs mt-4 text-muted-foreground">
          Page transitions use Framer Motion to create smooth animations between
          routes.
        </p>
      </motion.div>
    </div>
  );
};

export default AboutPage;
