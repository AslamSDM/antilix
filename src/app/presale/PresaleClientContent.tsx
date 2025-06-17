"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Diamond,
  Trophy,
  Coins,
  Timer,
  ChevronRight,
  Lock as LockIcon,
  BarChart4,
} from "lucide-react";
import LuxuryCard from "@/components/LuxuryCard";
import { DecorativeIcon } from "@/components/DecorativeElements";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import TokenProgressBar from "@/components/TokenProgressBar";
import CountdownTimer from "@/components/CountdownTimer";
import PresaleStats from "@/components/PresaleStats";
import { ReferralCard } from "@/components/ReferralCard";
import { WalletSelectorButton } from "@/components/WalletSelectorButton";
import PresaleBuyForm from "@/components/PresaleBuyForm";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { HyperText } from "@/components/magicui/hyper-text";
import useAudioPlayer from "@/components/hooks/useAudioPlayer";
import ScrollIndicator from "@/components/ScrollIndicator";
import ParticleBackground from "@/components/ParticleBackground";
import "../../components/sections/animation-utils.css";

// Use the /next import for Spline with React.lazy
const DynamicSpline = React.lazy(() => import("@splinetool/react-spline"));

import usePresale from "@/components/hooks/usePresale";
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/magicui/dot-pattern";

// Tokenomics data
const tokenomicsData = [
  { name: "Community", percentage: 35, color: "bg-primary" },
  { name: "Presale", percentage: 30, color: "bg-purple-600" },
  { name: "Team", percentage: 10, color: "bg-amber-500" },
  { name: "Liquidity", percentage: 10, color: "bg-green-500" },
  { name: "Advisers", percentage: 5, color: "bg-rose-500" },
  { name: "Marketing", percentage: 5, color: "bg-blue-500" },
  { name: "Developments", percentage: 3, color: "bg-indigo-500" },
  { name: "Partnerships", percentage: 2, color: "bg-pink-500" },
];

// Presale phases
const presalePhases = [
  {
    name: "Phase 1",
    price: "0.008 SOL",
    bonus: "+30%",
    status: "Completed",
    date: "May 1 - May 15",
  },
  {
    name: "Phase 2",
    price: "0.010 SOL",
    bonus: "+15%",
    status: "Completed",
    date: "May 16 - May 31",
  },
  {
    name: "Phase 3",
    price: "0.012 SOL",
    bonus: "None",
    status: "Active",
    date: "June 1 - June 30",
  },
];

// FAQ Item Component
interface FaqItemProps {
  question: string;
  answer: string;
  delay?: number;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer, delay = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ScrollAnimationWrapper delay={delay}>
      <div className="rounded-lg overflow-hidden">
        <LuxuryCard className="p-0">
          <button
            className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 text-left"
            onClick={() => setIsOpen(!isOpen)}
          >
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium pr-2">
              {question}
            </h3>
            <div
              className={`transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              } flex-shrink-0`}
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rotate-90" />
            </div>
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isOpen ? "auto" : 0,
              opacity: isOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-3 sm:p-4 md:p-6 pt-0 border-t border-primary/20">
              <p className="text-gray-300 text-xs sm:text-sm md:text-base">
                {answer}
              </p>
            </div>
          </motion.div>
        </LuxuryCard>
      </div>
    </ScrollAnimationWrapper>
  );
};

interface PresaleClientContentProps {
  contributorCount: number;
  totalRaised: number;
  usdRaised: number;
}

const PresaleClientContent: React.FC<PresaleClientContentProps> = ({
  contributorCount,
  totalRaised,
  usdRaised,
}) => {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the presale hook for wallet connection and presale data
  const { connected, switchNetwork, presaleNetwork } = usePresale();

  // Create refs for each section to track scroll position
  const statsSectionRef = useRef<HTMLElement>(null);
  const detailsSectionRef = useRef<HTMLElement>(null);
  const tokenomicsSectionRef = useRef<HTMLElement>(null);
  const whyInvestSectionRef = useRef<HTMLElement>(null);
  const referralSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);

  // Audio effects similar to the homepage
  const transitionSound = useAudioPlayer({
    src: "/sounds/section-change.mp3",
    volume: 0.2,
  });

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle wallet connection
  const handleWalletConnect = (type: "ethereum" | "solana") => {
    // When wallet is connected, switch to the appropriate network
    if (type === "ethereum") {
      switchNetwork("bsc");
    } else if (type === "solana") {
      switchNetwork("solana");
    }
  };

  // Track scroll position and update active section
  useEffect(() => {
    const sectionRefs = [
      statsSectionRef,
      detailsSectionRef,
      tokenomicsSectionRef,
      whyInvestSectionRef,
      referralSectionRef,
      faqSectionRef,
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      // Find the active section based on scroll position
      let newActiveSection = 0;
      sectionRefs.forEach((sectionRef, index) => {
        if (sectionRef.current) {
          const { offsetTop, offsetHeight } = sectionRef.current;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            newActiveSection = index;
          }
        }
      });

      // If active section changed, play transition sound
      if (newActiveSection !== activeSection) {
        transitionSound.play();
        setActiveSection(newActiveSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection, transitionSound]);

  return (
    <div
      ref={containerRef}
      className="relative w-full px-4 sm:px-6 md:px-8 lg:px-16 xl:px-24 min-h-screen"
    >
      {/* Loading overlay - similar to homepage */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 mt-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [0.9, 1, 0.9], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl text-primary font-display"
            >
              LITMEX
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Global Background - Always Active */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-purple-900/20" />

        {/* Interactive Grid Pattern - Fixed positioning */}
        <div className="absolute inset-0">
          <InteractiveGridPattern
            width={40}
            height={40}
            squares={[20, 20]}
            squaresClassName="fill-primary/5 stroke-primary/10 hover:fill-primary/20 transition-all duration-500"
            className="opacity-30 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
          />
        </div>

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0">
          <DotPattern
            width={20}
            height={20}
            cx={1}
            cy={1}
            cr={1}
            className="opacity-20 fill-primary/10 [mask-image:linear-gradient(to_bottom_right,white,transparent,white)]"
          />
        </div>

        {/* Animated floating orbs */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ left: "10%", top: "20%" }}
        />

        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] pointer-events-none"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 100, -40, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          style={{ right: "15%", top: "40%" }}
        />

        <motion.div
          className="absolute w-[250px] h-[250px] rounded-full bg-amber-500/5 blur-[60px] pointer-events-none"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -60, 80, 0],
            opacity: [0.2, 0.4, 0.2],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10,
          }}
          style={{ left: "60%", bottom: "20%" }}
        />

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0,200 Q400,100 800,200 T1600,200"
            stroke="url(#gradient1)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.path
            d="M0,400 Q300,300 600,400 T1200,400"
            stroke="url(#gradient2)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "loop",
              delay: 2,
            }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(212,175,55,0)" />
              <stop offset="50%" stopColor="rgba(212,175,55,0.8)" />
              <stop offset="100%" stopColor="rgba(212,175,55,0)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(147,51,234,0)" />
              <stop offset="50%" stopColor="rgba(147,51,234,0.6)" />
              <stop offset="100%" stopColor="rgba(147,51,234,0)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Particle effects */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Spline 3D background - with lower opacity and responsive display */}
      <div className="fixed inset-0 w-full h-full z-[1] pointer-events-none opacity-20 sm:opacity-25 md:opacity-30">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm sm:text-base">Loading 3D Scene...</p>
            </div>
          }
        >
          <DynamicSpline
            scene="https://prod.spline.design/PF2KyDFuGz-3ZjKz/scene.splinecode"
            className="w-full h-full absolute inset-0"
          />
        </Suspense>
      </div>

      {/* Scroll indicator at bottom - improved responsiveness */}
      <div className="fixed bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-10 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none w-full max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
        <ScrollIndicator fadeAfter={0.2} />
      </div>

      {/* Main presale section - Direct focus on stats and buying */}
      <section
        ref={statsSectionRef}
        className="min-h-screen relative z-10 py-8 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-4 overflow-hidden flex flex-col justify-center"
      >
        {/* Section-specific background enhancement */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: "50%",
              top: "30%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="container mx-auto relative z-10 mt-12 sm:mt-16 md:mt-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 md:mb-16"
          >
            <motion.div
              className="overflow-hidden relative mb-3"
              style={{ maxWidth: "100%", margin: "0 auto" }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-center font-display">
                <span className="text-primary">
                  <HyperText>LITMEX Token Presale</HyperText>
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-center max-w-2xl mx-auto text-white/80 px-2"
            >
              Join early for exclusive benefits, reduced fees, and priority
              access
            </motion.p>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center font-display">
            <span className="text-primary">
              <HyperText>Live Presale Statistics</HyperText>
            </span>
          </h2>

          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-12 px-2">
            <CountdownTimer
              targetDate={new Date("2025-06-30T23:59:59")}
              className="mb-4 sm:mb-6 md:mb-8"
            />
            <TokenProgressBar raised={totalRaised} goal={10000} />
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            <WalletSelectorButton
              variant="fancy"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md"
              onConnect={handleWalletConnect}
            />
            {connected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 text-center backdrop-blur-sm w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto"
              >
                <p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                  {presaleNetwork === "solana" ? "Solana" : "BSC"} Wallet
                  Connected
                </p>
                <p className="text-xs sm:text-sm opacity-80">
                  You can now participate in the presale
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-12">
            <PresaleStats
              contributors={contributorCount}
              raised={Number(totalRaised.toFixed(0))}
              usdRaised={Number(usdRaised.toFixed(0))}
              daysLeft={Math.ceil(
                (new Date("2025-06-30T23:59:59").getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
              referralBonus="15%"
            />

            {/* Direct Buy Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-6 sm:mt-8 md:mt-12 lg:mt-16 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto relative px-2"
            >
              <div className="w-full">
                <PresaleBuyForm
                  referralCode={searchParams?.get("ref") || ""}
                  className="backdrop-blur-xl border-primary/20 shadow-[0_0_15px_sm:shadow-[0_0_20px_md:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                />
              </div>

              {/* Enhanced dot pattern for buy form */}
              <div className="absolute inset-0 -z-10">
                <DotPattern
                  className={cn(
                    "opacity-20 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
                  )}
                  width={15}
                  height={15}
                  cx={1}
                  cy={1}
                  cr={0.5}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-6 mt-6 sm:mt-8 md:mt-10"
            >
              <LuxuryCard
                className="min-w-[120px] sm:min-w-[180px] md:min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-3 sm:p-4"
                animate={true}
              >
                <div className="text-center p-1 sm:p-2">
                  <DecorativeIcon
                    icon="diamond"
                    size="sm"
                    className="mb-2 sm:mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                    Current Price
                  </h3>
                  <motion.p
                    className="text-xl sm:text-2xl md:text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    0.012 USD
                  </motion.p>
                </div>
              </LuxuryCard>

              <LuxuryCard
                className="min-w-[120px] sm:min-w-[180px] md:min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-3 sm:p-4"
                animate={true}
              >
                <div className="text-center p-1 sm:p-2">
                  <DecorativeIcon
                    icon="crown"
                    size="sm"
                    className="mb-2 sm:mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                    Bonus
                  </h3>
                  <motion.p
                    className="text-xl sm:text-2xl md:text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    15% LMX
                  </motion.p>
                </div>
              </LuxuryCard>

              <LuxuryCard
                className="min-w-[120px] sm:min-w-[180px] md:min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-3 sm:p-4"
                animate={true}
              >
                <div className="text-center p-1 sm:p-2">
                  <DecorativeIcon
                    icon="spade"
                    size="sm"
                    className="mb-2 sm:mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-2 sm:mb-3 text-base sm:text-lg">
                    Supply
                  </h3>
                  <motion.p
                    className="text-xl sm:text-2xl md:text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    1 B
                  </motion.p>
                </div>
              </LuxuryCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Presale information */}
      <section
        ref={detailsSectionRef}
        className="py-8 sm:py-12 md:py-16 px-4 bg-black/20 backdrop-blur-sm relative z-10"
      >
        {/* Section-specific grid pattern */}
        <div className="absolute inset-0 z-0 square">
          <InteractiveGridPattern
            width={50}
            height={50}
            squares={[40, 40]}
            squaresClassName="fill-purple-500/5  stroke-purple-500/10 hover:fill-purple-500/20 transition-all duration-700"
            className="opacity-40 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <ScrollAnimationWrapper>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center font-display">
              Token <span className="text-primary">Presale</span> Details
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
            <ScrollAnimationWrapper delay={150}>
              <LuxuryCard className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                  <Coins className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mr-2 sm:mr-3 md:mr-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Token Information
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3 md:space-y-4 text-xs sm:text-sm md:text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Name</span>
                    <span className="font-medium">Litmex Token</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Symbol</span>
                    <span className="font-medium">LMX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Supply</span>
                    <span className="font-medium">1,000,000,000 LMX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network</span>
                    <span className="font-medium">Solana (SPL Token)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Current Price</span>
                    <span className="font-medium">$0.012</span>
                  </div>
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard className="p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                  <Timer className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mr-2 sm:mr-3 md:mr-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Presale Schedule
                  </h3>
                </div>
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {presalePhases.map((phase, index) => (
                    <div
                      key={index}
                      className="relative pl-6 sm:pl-7 md:pl-8 border-l border-primary/30"
                    >
                      <div
                        className={`absolute -left-2 top-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded-full ${
                          phase.status === "Completed"
                            ? "bg-primary"
                            : phase.status === "Active"
                            ? "bg-primary border-2 border-background animate-pulse"
                            : "bg-gray-700"
                        }`}
                      ></div>
                      <h4 className="font-bold text-base sm:text-lg">
                        {phase.name}
                      </h4>
                      <div className="text-xs sm:text-sm text-gray-300">
                        {phase.date}
                      </div>
                      <div className="flex justify-between items-center mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                        <span>Price: {phase.price}</span>
                        <span>Bonus: {phase.bonus}</span>
                      </div>
                      <div
                        className={`mt-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 inline-block rounded-md 
                        ${
                          phase.status === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : phase.status === "Active"
                            ? "bg-primary/20 text-primary"
                            : "bg-gray-700/30 text-gray-400"
                        }`}
                      >
                        {phase.status}
                      </div>
                    </div>
                  ))}
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>

          <ScrollAnimationWrapper delay={450}>
            <div className="p-4 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="flex items-center justify-center gap-6 flex-wrap"
              >
                <DecorativeIcon
                  icon="diamond"
                  size="lg"
                  className="opacity-20"
                />
                <DecorativeIcon icon="crown" size="md" className="opacity-15" />
                <DecorativeIcon icon="spade" size="lg" className="opacity-20" />
              </motion.div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>
      {/* Tokenomics section */}
      <section
        ref={tokenomicsSectionRef}
        className="py-8 sm:py-12 md:py-16 px-4 bg-gradient-to-b from-background/80 via-background/60 to-black/80 relative"
      >
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center font-display">
              <span className="text-primary">Token</span> Distribution
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <ScrollAnimationWrapper delay={150}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative aspect-square w-[240px] sm:w-[280px] md:w-[320px] lg:max-w-md mx-auto"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* {tokenomicsData.map((item, index) => {
                    const angle =
                      index * (360 / tokenomicsData.length) * (Math.PI / 180);
                    const x = Math.cos(angle) * 45 + 50;
                    const y = Math.sin(angle) * 45 + 50;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                          delay: 0.2 * index,
                        }}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                        whileHover={{
                          scale: 1.15,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <motion.div
                          className={`w-5 h-5 rounded-full ${item.color} mb-2 border border-white/10 shadow-glow`}
                          animate={{
                            boxShadow: [
                              "0 0 5px rgba(212, 175, 55, 0.2)",
                              "0 0 12px rgba(212, 175, 55, 0.5)",
                              "0 0 5px rgba(212, 175, 55, 0.2)",
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                        <span className="text-[10px] xs:text-xs sm:text-sm font-medium luxury-text">
                          {item.name}
                        </span>
                        <motion.span
                          className="text-[8px] xs:text-[10px] sm:text-xs text-white/90 font-bold"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {item.percentage}%
                        </motion.span>
                      </motion.div>
                    );
                  })} */}
                </div>
              </motion.div>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard
                className="p-4 sm:p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-300"
                icon="diamond"
                iconPosition="tr"
              >
                <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
                  <BarChart4 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary mr-2 sm:mr-3 md:mr-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    Token Allocation
                  </h3>
                </div>
                <div className="space-y-6">
                  {tokenomicsData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="flex justify-between mb-1 sm:mb-2 items-center">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.color} mr-1 sm:mr-2 border border-white/10`}
                          ></div>
                          <span className="text-primary/90 font-medium text-xs sm:text-sm md:text-base">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-white text-xs sm:text-sm md:text-base">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-black/50 h-2 sm:h-2.5 md:h-3 rounded-full p-[1px]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full rounded-full ${item.color} shadow-glow`}
                        ></motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Why invest section */}
      <section
        ref={whyInvestSectionRef}
        className="py-8 sm:py-12 md:py-16 px-4 bg-black/40 backdrop-blur-sm relative z-10"
      >
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center font-display">
              Why <span className="text-primary">Invest</span> in Litmex?
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <ScrollAnimationWrapper delay={100}>
              <LuxuryCard
                className="p-4 md:p-6 lg:p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="diamond"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-4 md:mb-6">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Trophy className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold luxury-text">
                    Premium Experiences
                  </h3>
                </div>
                <p className="text-gray-300 text-center text-sm md:text-base">
                  Access to exclusive games, luxury tournaments, and VIP
                  experiences available only to token holders.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={200}>
              <LuxuryCard
                className="p-4 md:p-6 lg:p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="crown"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-4 md:mb-6">
                  <motion.div
                    whileHover={{ rotate: -10, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <LockIcon className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold luxury-text">
                    Revenue Sharing
                  </h3>
                </div>
                <p className="text-gray-300 text-center text-sm md:text-base">
                  Token holders receive a portion of the platform's revenue
                  through staking rewards and exclusive bonuses.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard
                className="p-4 md:p-6 lg:p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="spade"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-4 md:mb-6">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-primary/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Diamond className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-bold luxury-text">
                    Limited Supply
                  </h3>
                </div>
                <p className="text-gray-300 text-center text-sm md:text-base">
                  With a fixed supply and deflationary mechanics, LMX tokens are
                  designed to increase in value as the platform grows.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section
        ref={referralSectionRef}
        className="py-8 sm:py-12 md:py-20 relative overflow-hidden"
      >
        {/* Enhanced referral section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900/30 overflow-hidden">
          <motion.div
            className="absolute w-full h-full opacity-50 sm:opacity-60 md:opacity-70 lg:opacity-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Animated star-like dots */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute rounded-full bg-white"
                style={{
                  width: Math.random() * 3 + 1 + "px",
                  height: Math.random() * 3 + 1 + "px",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}

            {/* Animated connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              <motion.path
                d="M0,100 C150,200 350,0 500,100"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="0.5"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
              <motion.path
                d="M100,0 C200,150 300,50 400,200"
                stroke="rgba(212, 175, 55, 0.1)"
                strokeWidth="0.5"
                fill="transparent"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.3 }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 2,
                }}
              />
            </svg>
          </motion.div>
        </div>

        <BackgroundDecorations />
        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <ScrollAnimationWrapper delay={0.2}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 sm:mb-6 md:mb-8 lg:mb-12 luxury-text-shadow text-gold-400">
              <DecorativeIcon
                icon="spade"
                size="xs"
                className="inline-block mr-1 sm:mr-2 md:mr-3 text-purple-400 align-middle"
              />
              Spread the Word & Earn
            </h2>
            <div className="text-center mb-6 max-w-4xl mx-auto">
              <div className="bg-black/40 backdrop-blur-sm border border-primary/20 rounded-lg p-4 sm:p-6 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4">
                  Two-Tier Referral Rewards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/40 p-4 rounded-lg border border-primary/10">
                    <div className="flex items-center mb-3">
                      <DecorativeIcon
                        icon="diamond"
                        size="xs"
                        className="text-primary mr-2"
                      />
                      <h4 className="text-base sm:text-lg font-medium">
                        LMX Token Rewards
                      </h4>
                    </div>
                    <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-left text-gray-300">
                      <li>
                        Level 1 (direct):{" "}
                        <span className="text-primary font-medium">
                          15% LMX
                        </span>{" "}
                        tokens
                      </li>
                      <li>
                        Level 2:{" "}
                        <span className="text-primary font-medium">
                          15% LMX
                        </span>{" "}
                        tokens
                      </li>
                      <li>
                        Level 3:{" "}
                        <span className="text-primary font-medium">
                          15% LMX
                        </span>{" "}
                        tokens
                      </li>
                      <li>
                        Level 4:{" "}
                        <span className="text-primary font-medium">
                          15% LMX
                        </span>{" "}
                        tokens
                      </li>
                      <li>
                        Level 5:{" "}
                        <span className="text-primary font-medium">
                          15% LMX
                        </span>{" "}
                        tokens
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border border-primary/10">
                    <div className="flex items-center mb-3">
                      <DecorativeIcon
                        icon="crown"
                        size="xs"
                        className="text-amber-400 mr-2"
                      />
                      <h4 className="text-base sm:text-lg font-medium">
                        Trump Token Rewards
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base text-left text-gray-300 mb-3">
                      Direct referrers will receive{" "}
                      <span className="text-amber-400 font-medium">
                        10% Trump
                      </span>{" "}
                      tokens in Solana immediately upon successful referral
                      purchase.
                    </p>
                    <div className="flex items-center text-xs sm:text-sm bg-amber-500/10 p-2 rounded">
                      <span className="text-amber-300">
                        ⚠️ Immediately transferred to your Solana wallet
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-base sm:text-lg">
                Share your unique referral link and earn rewards on every
                purchase made through it
              </p>
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.4}>
            <ReferralCard />
          </ScrollAnimationWrapper>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute bottom-4 sm:bottom-6 md:bottom-10 right-4 sm:right-6 md:right-10 w-10 sm:w-16 md:w-20 h-10 sm:h-16 md:h-20 opacity-20 pointer-events-none"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <DecorativeIcon icon="diamond" size="lg" className="text-primary" />
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section
        ref={faqSectionRef}
        className="py-8 sm:py-12 md:py-20 relative overflow-hidden"
      >
        {/* Interactive gradient background */}
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-20 sm:opacity-25 md:opacity-30"
            style={{
              background:
                "radial-gradient(circle at center, rgba(212,175,55,0.15) 0%, rgba(0,0,0,0) 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          {/* Subtle floating shapes */}
          <motion.div
            className="absolute w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 rounded-full bg-primary/5 blur-[100px]"
            style={{ left: "10%", top: "20%" }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.div
            className="absolute w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full bg-purple-500/5 blur-[80px]"
            style={{ right: "15%", bottom: "10%" }}
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          />
        </div>

        <div className="container mx-auto max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl px-2 relative z-10">
          <ScrollAnimationWrapper>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 md:mb-8 lg:mb-12 text-center font-display">
                Frequently <span className="text-primary">Asked</span> Questions
              </h2>
            </motion.div>
          </ScrollAnimationWrapper>

          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <FaqItem
              question="What is Litmex?"
              answer="Litmex is a premium web3 gambling platform that combines the excitement of gaming with blockchain technology. The platform offers provably fair games, exclusive rewards, and luxury experiences for its users."
              delay={100}
            />
            <FaqItem
              question="How can I participate in the presale?"
              answer="To participate in the presale, connect your Solana wallet, enter the amount of SOL you wish to invest, and complete the transaction. The LMX tokens will be distributed to your wallet once the presale concludes."
              delay={200}
            />
            <FaqItem
              question="What are the benefits of buying during presale?"
              answer="Presale investors receive tokens at a discounted price compared to the public launch. You'll also receive bonuses based on the current phase and will have early access to platform features and exclusive VIP benefits."
              delay={300}
            />
            <FaqItem
              question="When will LMX be listed on exchanges?"
              answer="LMX will be listed on Solana decentralized exchanges within 2-3 weeks after the presale ends. Major centralized exchange listings will follow in the subsequent months as the platform grows."
              delay={400}
            />
            <FaqItem
              question="Is there a vesting period for presale tokens?"
              answer="No, all presale tokens will be fully unlocked and transferable once the token is launched on Solana. Team tokens are subject to a 12-month vesting period with monthly unlocks to ensure long-term commitment."
              delay={500}
            />
            <FaqItem
              question="How will the raised funds be used?"
              answer="30% for platform development, 25% for liquidity provision, 20% for marketing and partnerships, 15% for legal and compliance, and 10% for operations and security infrastructure."
              delay={600}
            />
            <FaqItem
              question="Why did you choose Solana blockchain?"
              answer="We selected Solana for its ultra-fast transaction speeds (up to 65,000 TPS), negligible gas fees (less than $0.01 per transaction), and growing ecosystem, making it ideal for gaming applications. Solana's efficiency enables seamless in-game transactions and rewards distribution."
              delay={700}
            />
            <FaqItem
              question="How do I set up a Solana wallet?"
              answer="We recommend using Phantom or Solflare wallets. Download the browser extension or mobile app, create a new wallet, securely store your recovery phrase offline, and fund your wallet with SOL from an exchange. Make sure to connect your wallet on our website before participating in the presale."
              delay={800}
            />
            <FaqItem
              question="What is the total supply of LMX tokens?"
              answer="The total supply of Litmex (LMX) tokens is 1 billion (1,000,000,000). Unlike Ethereum-based tokens, Solana SPL tokens don't require a hardcap on purchases during presale, allowing unrestricted participation while maintaining our tokenomics distribution."
              delay={900}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PresaleClientContent;
