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
  { name: "Presale", percentage: 40, color: "bg-primary" },
  { name: "Team", percentage: 10, color: "bg-purple-600" },
  { name: "Marketing", percentage: 10, color: "bg-amber-500" },
  { name: "Rewards", percentage: 10, color: "bg-rose-500" },
];

// Presale phases
const presalePhases = [
  {
    name: "Phase 1",
    price: "0.0005 ETH",
    bonus: "+30%",
    status: "Completed",
    date: "August 15 - August 30",
  },
  {
    name: "Phase 2",
    price: "0.00075 ETH",
    bonus: "+15%",
    status: "Active",
    date: "September 1 - September 15",
  },
  {
    name: "Phase 3",
    price: "0.001 ETH",
    bonus: "None",
    status: "Upcoming",
    date: "September 20 - October 5",
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
            className="w-full flex items-center justify-between p-6 text-left"
            onClick={() => setIsOpen(!isOpen)}
          >
            <h3 className="text-xl font-medium">{question}</h3>
            <div
              className={`transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronRight className="w-5 h-5 rotate-90" />
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
            <div className="p-6 pt-0 border-t border-primary/20">
              <p className="text-gray-300">{answer}</p>
            </div>
          </motion.div>
        </LuxuryCard>
      </div>
    </ScrollAnimationWrapper>
  );
};

const PresaleClientContent = () => {
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
    <div ref={containerRef} className="relative w-full px-24  min-h-screen">
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

      {/* Spline 3D background - with lower opacity */}
      <div className="fixed inset-0 w-full h-full z-[1] pointer-events-none opacity-30">
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <p>Loading 3D Scene...</p>
            </div>
          }
        >
          <DynamicSpline
            scene="https://prod.spline.design/PF2KyDFuGz-3ZjKz/scene.splinecode"
            className="w-full h-full absolute inset-0"
          />
        </Suspense>
      </div>

      {/* Scroll indicator at bottom */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <ScrollIndicator fadeAfter={0.2} />
      </div>

      {/* Main presale section - Direct focus on stats and buying */}
      <section
        ref={statsSectionRef}
        className="min-h-screen relative z-10 py-20 px-4 overflow-hidden flex flex-col justify-center"
      >
        {/* Section-specific background enhancement */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none"
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

        <div className="container mx-auto relative z-10 mt-24 ">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <motion.div
              className="overflow-hidden relative mb-3"
              style={{ maxWidth: "max-content", margin: "0 auto" }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-center font-display">
                <span className="text-primary">
                  <HyperText>LITMEX Token Presale</HyperText>
                </span>
              </h1>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ width: 0, left: "50%" }}
                animate={{ width: "100%", left: "0%" }}
                transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-center max-w-2xl mx-auto text-white/80"
            >
              Join early for exclusive benefits, reduced fees, and priority
              access
            </motion.p>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
            <span className="text-primary">
              <HyperText>Live Presale Statistics</HyperText>
            </span>
          </h2>

          <div className="max-w-3xl mx-auto mb-12">
            <CountdownTimer
              targetDate={new Date("2025-09-15T23:59:59")}
              className="mb-8"
            />
            <TokenProgressBar raised={358} goal={500} />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 mb-12">
            <WalletSelectorButton
              variant="fancy"
              className="w-full max-w-md"
              onConnect={handleWalletConnect}
            />
            {connected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center backdrop-blur-sm"
              >
                <p className="text-lg font-semibold mb-2">
                  {presaleNetwork === "solana" ? "Solana" : "BSC"} Wallet
                  Connected
                </p>
                <p className="text-sm opacity-80">
                  You can now participate in the presale
                </p>
              </motion.div>
            )}
          </div>

          <div className="mt-12">
            <PresaleStats
              contributors={1250}
              raised={358}
              daysLeft={Math.ceil(
                (new Date("2025-09-15T23:59:59").getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
              referralBonus="5%"
            />

            {/* Direct Buy Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 max-w-2xl mx-auto relative"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PresaleBuyForm
                    referralCode={searchParams?.get("ref") || ""}
                    className="backdrop-blur-xl border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                  />
                </div>
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
              className="flex flex-col md:flex-row justify-center items-stretch gap-6 mt-10"
            >
              <LuxuryCard
                className="min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-4"
                animate={true}
              >
                <div className="text-center p-2">
                  <DecorativeIcon
                    icon="diamond"
                    size="sm"
                    className="mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-3 text-lg">
                    Current Price
                  </h3>
                  <motion.p
                    className="text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    0.00075 ETH
                  </motion.p>
                </div>
              </LuxuryCard>

              <LuxuryCard
                className="min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-4"
                animate={true}
              >
                <div className="text-center p-2">
                  <DecorativeIcon
                    icon="crown"
                    size="sm"
                    className="mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-3 text-lg">
                    Bonus
                  </h3>
                  <motion.p
                    className="text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    +15%
                  </motion.p>
                </div>
              </LuxuryCard>

              <LuxuryCard
                className="min-w-[220px] transform hover:scale-[1.08] transition-all duration-300 p-4"
                animate={true}
              >
                <div className="text-center p-2">
                  <DecorativeIcon
                    icon="spade"
                    size="sm"
                    className="mb-4 mx-auto animate-pulse-slow"
                  />
                  <h3 className="luxury-text font-medium mb-3 text-lg">
                    Hard Cap
                  </h3>
                  <motion.p
                    className="text-3xl font-bold luxury-text"
                    animate={{
                      textShadow: [
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                        "0px 0px 8px rgba(212, 175, 55, 0.7)",
                        "0px 0px 2px rgba(55, 128, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  >
                    500 ETH
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
        className="py-16 px-4 bg-black/20 backdrop-blur-sm relative z-10"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              Token <span className="text-primary">Presale</span> Details
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <ScrollAnimationWrapper delay={150}>
              <LuxuryCard className="p-8">
                <div className="flex items-center mb-6">
                  <Coins className="w-8 h-8 text-primary mr-4" />
                  <h3 className="text-2xl font-bold">Token Information</h3>
                </div>
                <div className="space-y-4">
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
                    <span className="font-medium">100,000,000 LMX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Network</span>
                    <span className="font-medium">Ethereum (ERC-20)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Initial Market Cap</span>
                    <span className="font-medium">$750,000</span>
                  </div>
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard className="p-8">
                <div className="flex items-center mb-6">
                  <Timer className="w-8 h-8 text-primary mr-4" />
                  <h3 className="text-2xl font-bold">Presale Schedule</h3>
                </div>
                <div className="space-y-6">
                  {presalePhases.map((phase, index) => (
                    <div
                      key={index}
                      className="relative pl-8 border-l border-primary/30"
                    >
                      <div
                        className={`absolute -left-2 top-0 w-4 h-4 rounded-full ${
                          phase.status === "Completed"
                            ? "bg-primary"
                            : phase.status === "Active"
                            ? "bg-primary border-2 border-background animate-pulse"
                            : "bg-gray-700"
                        }`}
                      ></div>
                      <h4 className="font-bold text-lg">{phase.name}</h4>
                      <div className="text-sm text-gray-300">{phase.date}</div>
                      <div className="flex justify-between items-center mt-2">
                        <span>Price: {phase.price}</span>
                        <span>Bonus: {phase.bonus}</span>
                      </div>
                      <div
                        className={`mt-1 text-xs px-2 py-1 inline-block rounded-md 
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
        className="py-16 px-4 bg-gradient-to-b from-background/80 via-background/60 to-black/80 relative"
      >
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              <span className="text-primary">Token</span> Distribution
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimationWrapper delay={150}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative aspect-square max-w-md mx-auto"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-primary/10 flex items-center justify-center animate-pulse-slow shadow-glow">
                    <div
                      className="w-[80%] h-[80%] rounded-full border-4 border-primary/20 flex items-center justify-center animate-spin-slow"
                      style={{ animationDirection: "reverse" }}
                    >
                      <div
                        className="w-[60%] h-[60%] rounded-full border-4 border-primary/30 flex items-center justify-center animate-spin-slow"
                        style={{ animationDuration: "20s" }}
                      >
                        <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xl font-bold shadow-[0_0_20px_rgba(212,175,55,0.5)]">
                          <motion.div
                            animate={{
                              scale: [1, 1.15, 1],
                              textShadow: [
                                "0 0 5px rgba(212, 175, 55, 0.5)",
                                "0 0 20px rgba(212, 175, 55, 0.9)",
                                "0 0 5px rgba(212, 175, 55, 0.5)",
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="luxury-text font-display"
                          >
                            LMX
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {tokenomicsData.map((item, index) => {
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
                        <span className="text-sm font-medium luxury-text">
                          {item.name}
                        </span>
                        <motion.span
                          className="text-xs text-white/90 font-bold"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {item.percentage}%
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard
                className="p-8 transform hover:scale-[1.02] transition-all duration-300"
                icon="diamond"
                iconPosition="tr"
              >
                <div className="flex items-center mb-6">
                  <BarChart4 className="w-8 h-8 text-primary mr-4" />
                  <h3 className="text-2xl font-bold">Token Allocation</h3>
                </div>
                <div className="space-y-6">
                  {tokenomicsData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                    >
                      <div className="flex justify-between mb-2 items-center">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${item.color} mr-2 border border-white/10`}
                          ></div>
                          <span className="text-primary/90 font-medium">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-white">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-black/50 h-3 rounded-full p-[1px]">
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
        className="py-16 px-4 bg-black/40 backdrop-blur-sm relative z-10"
      >
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              Why <span className="text-primary">Invest</span> in Litmex?
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimationWrapper delay={100}>
              <LuxuryCard
                className="p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="diamond"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-6">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Trophy className="w-8 h-8 text-amber-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold luxury-text">
                    Premium Experiences
                  </h3>
                </div>
                <p className="text-gray-300 text-center">
                  Access to exclusive games, luxury tournaments, and VIP
                  experiences available only to token holders.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={200}>
              <LuxuryCard
                className="p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="crown"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-6">
                  <motion.div
                    whileHover={{ rotate: -10, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-indigo-500/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(99,102,241,0.3)] border border-indigo-400/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <LockIcon className="w-8 h-8 text-indigo-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold luxury-text">
                    Revenue Sharing
                  </h3>
                </div>
                <p className="text-gray-300 text-center">
                  Token holders receive a portion of the platform's revenue
                  through staking rewards and exclusive bonuses.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard
                className="p-8 h-full transform transition-all hover:scale-105 hover:-translate-y-1"
                icon="spade"
                iconPosition="tr"
                animate={true}
              >
                <div className="text-center mb-6">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(212,175,55,0.3)] border border-primary/30"
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Diamond className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold luxury-text">
                    Limited Supply
                  </h3>
                </div>
                <p className="text-gray-300 text-center">
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
        className="py-12 md:py-20 relative overflow-hidden"
      >
        {/* Enhanced referral section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-purple-900/30 overflow-hidden">
          <motion.div
            className="absolute w-full h-full"
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
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimationWrapper delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 luxury-text-shadow text-gold-400">
              <DecorativeIcon
                icon="spade"
                size="md"
                className="inline-block mr-3 text-purple-400"
              />
              Spread the Word & Earn
            </h2>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.4}>
            <ReferralCard />
          </ScrollAnimationWrapper>
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute bottom-10 right-10 w-20 h-20 opacity-20 pointer-events-none"
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
        className="py-12 md:py-20 relative overflow-hidden"
      >
        {/* Interactive gradient background */}
        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 opacity-30"
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
            className="absolute w-96 h-96 rounded-full bg-primary/5 blur-[100px]"
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
            className="absolute w-64 h-64 rounded-full bg-purple-500/5 blur-[80px]"
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

        <div className="container mx-auto max-w-4xl relative z-10">
          <ScrollAnimationWrapper>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
                Frequently <span className="text-primary">Asked</span> Questions
              </h2>
            </motion.div>
          </ScrollAnimationWrapper>

          <div className="space-y-6">
            <FaqItem
              question="What is Litmex?"
              answer="Litmex is a premium web3 gambling platform that combines the excitement of gaming with blockchain technology. The platform offers provably fair games, exclusive rewards, and luxury experiences for its users."
              delay={100}
            />
            <FaqItem
              question="How can I participate in the presale?"
              answer="To participate in the presale, connect your Web3 wallet (MetaMask, Trust Wallet, etc.), enter the amount of ETH you wish to invest, and complete the transaction. The LMX tokens will be distributed to your wallet once the presale concludes."
              delay={200}
            />
            <FaqItem
              question="What are the benefits of buying during presale?"
              answer="Presale investors receive tokens at a discounted price compared to the public launch. You'll also receive bonuses based on the current phase and will have early access to platform features and exclusive VIP benefits."
              delay={300}
            />
            <FaqItem
              question="When will LMX be listed on exchanges?"
              answer="LMX will be listed on decentralized exchanges within 2-3 weeks after the presale ends. Major centralized exchange listings will follow in the subsequent months as the platform grows."
              delay={400}
            />
            <FaqItem
              question="Is there a vesting period for presale tokens?"
              answer="No, all presale tokens will be fully unlocked and transferable once the token is launched. Team tokens, however, are subject to a 12-month vesting period with monthly unlocks to ensure long-term commitment."
              delay={500}
            />
            <FaqItem
              question="How will the raised funds be used?"
              answer="30% for platform development, 25% for liquidity provision, 20% for marketing and partnerships, 15% for legal and compliance, and 10% for operations and security infrastructure."
              delay={600}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default PresaleClientContent;
