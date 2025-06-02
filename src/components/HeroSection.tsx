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
import { TextAnimate } from "./magicui/text-animate";
import { InteractiveGridPattern } from "./magicui/interactive-grid-pattern";
import { cn } from "@/lib/utils";
import Spline from "@splinetool/react-spline";

// Lazy load Spline component using React.lazy instead of Next.js dynamic import
const DynamicSpline = React.lazy(() => import("@splinetool/react-spline"));

// Text content for the hero section
const heroTitle = "Premium Web3 Gaming";
const heroDescription =
  "ANTILIX combines luxury casino experiences with cutting-edge blockchain technology. Join our presale to secure early access to the most exclusive web3 gaming platform.";

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
  const { scrollYProgress } = useScroll();
  const themes = useTheme();
  const windowSize = useWindowSize();

  // Track scroll position to hide hero section with improved sensitivity
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Convert to a value between 0 and 1 for opacity control
      // Hide section completely after scrolling ~5% of the viewport height for faster disappearing
      const scrollFactor = Math.min(
        scrollPosition / (window.innerHeight * 0.05),
        1
      );
      setScrollY(scrollFactor);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial call to ensure proper state on mount
    // handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Enhanced animation variants with scroll-based opacity
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

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background/60 backdrop-blur-sm text-foreground p-4 md:p-8 sticky top-0"
        style={{
          opacity: 1 - scrollY, // Fade out entire section based on scroll
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          visibility: scrollY >= 0.99 ? "hidden" : "visible", // Complete hide when fully scrolled
          pointerEvents: scrollY >= 0.5 ? "none" : "auto", // Disable interactions when fading
          zIndex: scrollY >= 0.5 ? -100 : 10, // Keep above the grid pattern when visible
          transform: `translateY(${scrollY * -50}px)`, // Slight move up effect while disappearing
          position: scrollY >= 0.99 ? "absolute" : "sticky", // Change to absolute when hidden to not interfere with scrolling
          height: scrollY >= 0.99 ? "0" : "100vh", // Collapse height when fully hidden
        }}
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
            opacity: isSplineReady ? 1 - scrollY * 1.5 : 0, // Hide when scrolling and until loaded
            transition: "opacity 0.5s ease-in-out",
            visibility: scrollY >= 0.7 ? "hidden" : "visible", // Complete hide when significantly scrolled
          }}
        >
          {/* <Suspense fallback={<></>}> */}
          <Spline
            // scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
            // scene="https://prod.spline.design/TzS95U5C42rKjFN4/scene.splinecode"
            // scene="https://prod.spline.design/PF2KyDFuGz-3ZjKz/scene.splinecode" // rotating logo
            // scene="https://prod.spline.design/BBw6Kuk4CCjKtUve/scene.splinecode" // dna
            // scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
            // scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
            scene="https://prod.spline.design/3ETSH65uhct2x1US/scene.splinecode"
            onLoad={handleSplineLoad}
          />
          {/* </Suspense> */}
        </div>
        <motion.div
          className={`z-10 relative  w-[98%] md:w-[85%] lg:w-[75%]  h-[80vh] flex items-center justify-center ${
            isSmallScreen ? "mt-24 pb-12 px-3" : "mt-40 pb-16 md:pb-24 px-5"
          }`}
          variants={containerVariants}
          initial="hidden"
          animate={isSplineReady ? "visible" : "hidden"} // Always animate when Spline is ready
          style={{
            opacity: 1 - scrollY * 3, // Fade out even faster than the main section
            transform: `translateY(${scrollY * -30}px)`, // Slight float effect while disappearing
          }}
        >
          <div
            className="hero-glass-card mx-auto w-full h-full flex items-center justify-center"
            style={{
              transform: `perspective(1000px) rotateX(${
                (mousePos.y * 2 - 1) * 1.5
              }deg) rotateY(${(mousePos.x * 2 - 1) * 1.5}deg)`,
              transition: "transform 0.5s ease-out",
            }}
          >
            <div className="cut-corner-border"></div>
            <div className="flex flex-col items-center text-center">
              <motion.div variants={itemVariants} className="mb-8 -mt-4 pt-2">
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
                  Join ANTILIX Presale
                </RippleButton>
              </Button>
            </motion.div> */}

              {/* Security badges */}
              <motion.div variants={itemVariants} className="mb-4 mt-2">
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
    </>
  );
};

export default HeroSection;
