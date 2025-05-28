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
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { useLoading } from "./providers/loading-provider";
import { HyperText } from "@/components/magicui/hyper-text";

// Lazy load Spline component using React.lazy instead of Next.js dynamic import
const DynamicSpline = React.lazy(() => import("@splinetool/react-spline"));

// Text content for the hero section
const heroTitle = "Premium Web3 Gaming";
const heroDescription =
  "ANTILIXH combines luxury casino experiences with cutting-edge blockchain technology. Join our presale to secure early access to the most exclusive web3 gaming platform.";

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
  const { setProgress, completeLoading } = useLoading();
  const heroRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<any>(null);
  const sentRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const { scrollYProgress } = useScroll({
    target: sentRef,
    offset: ["start 0.5", "end 0.5"],
  });
  const themes = useTheme();
  const windowSize = useWindowSize();

  // Determine if screen is small
  const isSmallScreen = windowSize.width < 768;

  // Handle Spline load event
  const handleSplineLoad = useCallback(
    (splineApp: Application) => {
      setSplineApp(splineApp);
      splineRef.current = splineApp;

      // Adjust the scene based on screen size

      // For small screens, adjust camera or scale

      // Simulate final loading steps after Spline is technically ready
      // This creates a more polished experience with our loading animation
      let progress = 0.7; // Spline loaded = 70% complete

      const progressInterval = setInterval(() => {
        progress += 0.05;
        setProgress(progress);

        if (progress >= 1) {
          clearInterval(progressInterval);

          // Slight delay before showing content
          setTimeout(() => {
            console.log("Spline is ready");
            setIsSplineReady(true);
            completeLoading(); // Inform the app that loading is complete
          }, 500);
        }
      }, 200);
    },
    [themes.theme, isSmallScreen, setProgress, completeLoading]
  );

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
          opacity: isSplineReady ? 1 : 0, // Hide until loaded
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <Suspense fallback={<></>}>
          <DynamicSpline
            // scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
            // scene="https://prod.spline.design/TzS95U5C42rKjFN4/scene.splinecode"
            // scene="https://prod.spline.design/PF2KyDFuGz-3ZjKz/scene.splinecode" // rotating logo
            // scene="https://prod.spline.design/BBw6Kuk4CCjKtUve/scene.splinecode" // dna
            scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
            onLoad={handleSplineLoad}
          />
        </Suspense>
      </div>
      <motion.div
        className={`z-10 relative ${
          isSmallScreen ? "mt-24 pb-12 px-3" : "mt-40 pb-16 md:pb-24 px-5"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate={isSplineReady ? "visible" : "hidden"} // Animate text when Spline is ready
      >
        <div
          className="hero-glass-card mx-auto max-w-4xl"
          style={{
            transform: `perspective(1000px) rotateX(${
              (mousePos.y * 2 - 1) * 1.5
            }deg) rotateY(${(mousePos.x * 2 - 1) * 1.5}deg)`,
            transition: "transform 0.5s ease-out",
          }}
        >
          <div className="cut-corner-border"></div>
          <div className="flex flex-col items-center text-center">
            <motion.div
              variants={itemVariants}
              className="mb-8 -mt-4 pt-2"
              style={{ opacity: scrollY > 0.19 ? 0 : 1 }}
            >
              <HyperText
                className={`inline-block py-2 px-4 ${
                  isSmallScreen ? "text-4xl" : "text-6xl"
                } font-bold text-secondary-foreground font-display`}
                duration={1200}
                startOnView={true}
                animateOnHover={true}
              >
                {heroTitle}
              </HyperText>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className={`${
                isSmallScreen ? "text-lg" : "text-xl md:text-xl"
              } flex flex-wrap max-w-3xl mb-10 px-6 text-foreground/90 dark:text-foreground/85 dark:text-shadow-sm leading-relaxed`}
              style={{
                opacity: scrollY > 0.19 ? 0 : 1,
              }}
            >
              <p ref={sentRef} className="font-medium">
                {heroDescription}
              </p>
            </motion.div>

            {/* <motion.div variants={itemVariants}>
              <Button>
                <RippleButton
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={handleExplore}
                  disabled={getStartedClicked}
                >
                  Join ANTILIXH Presale
                </RippleButton>
              </Button>
            </motion.div> */}

            {/* Security badges */}
            <motion.div
              variants={itemVariants}
              className="mb-4 mt-2"
              style={{ opacity: scrollY > 0.19 ? 0 : 1 }}
            >
              <Link href="/presale">
                <button className="px-8 py-3.5 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-md hover:from-primary hover:to-primary/90 transition-all duration-300 font-medium flex items-center mx-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1">
                  <span className="mr-2 text-base">Join Presale</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {/* Foreground content - position adjusted for small screens */}
    </section>
  );
};

export default HeroSection;
