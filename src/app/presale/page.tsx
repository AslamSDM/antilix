"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Diamond,
  Trophy,
  Coins,
  Timer,
  Calendar,
  ChevronRight,
  Lock as LockIcon,
  BarChart4,
  Wallet,
  ArrowRight,
} from "lucide-react";
import LuxuryCard from "@/components/LuxuryCard";
import {
  DecorativeCorner,
  DecorativeText,
  DecorativeIcon,
  Sparkle,
} from "@/components/DecorativeElements";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import TokenProgressBar from "@/components/TokenProgressBar";
import CountdownTimer from "@/components/CountdownTimer";
import GlowButton from "@/components/GlowButton";
import PresaleStats from "@/components/PresaleStats";
import { ReferralCard } from "@/components/ReferralCard";

// Tokenomics data
const tokenomicsData = [
  { name: "Presale", percentage: 40, color: "bg-primary" },
  { name: "Liquidity", percentage: 30, color: "bg-indigo-500" },
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

export default function PresalePage() {
  const [amountETH, setAmountETH] = useState("");
  const [tokensToReceive, setTokensToReceive] = useState(0);

  // Calculate tokens based on current phase price (Phase 2)
  const handleCalculate = () => {
    if (!amountETH || isNaN(parseFloat(amountETH))) {
      setTokensToReceive(0);
      return;
    }

    const ethAmount = parseFloat(amountETH);
    // Phase 2 price with 15% bonus
    const baseTokens = ethAmount / 0.00075;
    const bonusTokens = baseTokens * 0.15;
    setTokensToReceive(baseTokens + bonusTokens);
  };

  return (
    <>
      {/* Background decorations */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <BackgroundDecorations count={15} opacity={0.05} />
      </div>

      {/* Hero section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-background to-background/90 relative overflow-hidden min-h-[50vh] flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-20 right-[10%] opacity-30">
          <DecorativeIcon
            icon="diamond"
            className="floating-element animation-delay-300"
          />
        </div>
        <div className="absolute bottom-20 left-[15%] opacity-20">
          <DecorativeIcon
            icon="spade"
            className="floating-element animation-delay-700"
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-display">
              <span className="text-primary">ANTILIXH</span> Presale
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200/80 max-w-2xl mx-auto">
              Join the exclusive presale of the premium web3 gambling platform
              token
            </p>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
              <div className="luxury-stat-card p-6 min-w-[200px]">
                <h3 className="text-primary font-medium mb-1">Current Price</h3>
                <p className="text-2xl font-bold">0.00075 ETH</p>
              </div>

              <div className="luxury-stat-card p-6 min-w-[200px]">
                <h3 className="text-primary font-medium mb-1">Bonus</h3>
                <p className="text-2xl font-bold">+15%</p>
              </div>

              <div className="luxury-stat-card p-6 min-w-[200px]">
                <h3 className="text-primary font-medium mb-1">Hard Cap</h3>
                <p className="text-2xl font-bold">500 ETH</p>
              </div>
            </div>

            <div className="mt-12 max-w-2xl mx-auto">
              {/* Adding countdown timer */}
              <CountdownTimer
                targetDate={new Date("2025-09-15T23:59:59")}
                className="mb-8"
              />

              {/* Adding progress bar */}
              <TokenProgressBar raised={358} goal={500} />
            </div>

            {/* Presale Stats */}
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
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Presale information */}
      <section className="py-16 px-4 bg-black/40 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
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
                    <span className="font-medium">ANTILIXH Token</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Symbol</span>
                    <span className="font-medium">ANTX</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Supply</span>
                    <span className="font-medium">100,000,000 ANTX</span>
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
                        className="mt-1 text-xs px-2 py-1 inline-block rounded-md 
                        ${phase.status === 'Completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : phase.status === 'Active' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-gray-700/30 text-gray-400'}"
                      >
                        {phase.status}
                      </div>
                    </div>
                  ))}
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>

          {/* Token calculator */}
          <ScrollAnimationWrapper delay={450}>
            <LuxuryCard className="p-8 max-w-3xl mx-auto">
              <div className="flex items-center mb-6">
                <Wallet className="w-8 h-8 text-primary mr-4" />
                <h3 className="text-2xl font-bold">Token Calculator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-300">
                    Amount in ETH
                  </label>
                  <input
                    type="number"
                    className="w-full bg-black/50 border border-primary/30 rounded-md p-3 text-white"
                    placeholder="0.0"
                    value={amountETH}
                    onChange={(e) => setAmountETH(e.target.value)}
                  />
                </div>

                <div className="flex justify-center">
                  <motion.button
                    onClick={handleCalculate}
                    className="p-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition-all duration-200
                      border border-primary/30"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{
                      boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-300">
                    ANTX Tokens
                  </label>
                  <div className="w-full bg-black/50 border border-primary/30 rounded-md p-3 text-white">
                    {tokensToReceive.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <GlowButton className="flex items-center mx-auto">
                  <span>Connect Wallet to Participate</span>
                  <ChevronRight className="ml-2 w-5 h-5" />
                </GlowButton>
              </div>
            </LuxuryCard>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Tokenomics section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background/80 via-background/60 to-black/80 relative">
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              <span className="text-primary">Token</span> Distribution
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollAnimationWrapper delay={150}>
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Chart illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-4 border-primary/10 flex items-center justify-center">
                    <div className="w-[80%] h-[80%] rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <div className="w-[60%] h-[60%] rounded-full border-4 border-primary/30 flex items-center justify-center">
                        <div className="w-[40%] h-[40%] rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center text-xl font-bold">
                          ANTX
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Distribution segments */}
                  {tokenomicsData.map((item, index) => {
                    const angle =
                      index * (360 / tokenomicsData.length) * (Math.PI / 180);
                    const x = Math.cos(angle) * 45 + 50;
                    const y = Math.sin(angle) * 45 + 50;

                    return (
                      <div
                        key={index}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full ${item.color} mb-1`}
                        ></div>
                        <span className="text-xs font-medium">{item.name}</span>
                        <span className="text-xs text-gray-400">
                          {item.percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard className="p-8">
                <div className="flex items-center mb-6">
                  <BarChart4 className="w-8 h-8 text-primary mr-4" />
                  <h3 className="text-2xl font-bold">Allocation</h3>
                </div>
                <div className="space-y-5">
                  {tokenomicsData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span>{item.name}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700/30 h-2 rounded-full">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Why invest section */}
      <section className="py-16 px-4 bg-black/40 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              Why <span className="text-primary">Invest</span> in ANTILIXH?
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimationWrapper delay={100}>
              <LuxuryCard className="p-6 h-full">
                <div className="flex items-center mb-4">
                  <Trophy className="w-6 h-6 text-amber-500 mr-3" />
                  <h3 className="text-xl font-bold">Premium Experiences</h3>
                </div>
                <p className="text-gray-300">
                  Access to exclusive games, luxury tournaments, and VIP
                  experiences available only to token holders.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={200}>
              <LuxuryCard className="p-6 h-full">
                <div className="flex items-center mb-4">
                  <LockIcon className="w-6 h-6 text-indigo-500 mr-3" />
                  <h3 className="text-xl font-bold">Revenue Sharing</h3>
                </div>
                <p className="text-gray-300">
                  Token holders receive a portion of the platform's revenue
                  through staking rewards and exclusive bonuses.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <LuxuryCard className="p-6 h-full">
                <div className="flex items-center mb-4">
                  <Diamond className="w-6 h-6 text-primary mr-3" />
                  <h3 className="text-xl font-bold">Limited Supply</h3>
                </div>
                <p className="text-gray-300">
                  With a fixed supply and deflationary mechanics, ANTX tokens
                  are designed to increase in value as the platform grows.
                </p>
              </LuxuryCard>
            </ScrollAnimationWrapper>
          </div>

          <div className="mt-12 text-center">
            <ScrollAnimationWrapper delay={400}>
              <GlowButton className="px-8 py-4 text-lg">
                Join the Presale Now
              </GlowButton>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-900 to-purple-900/30 relative">
        <BackgroundDecorations />
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimationWrapper delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 luxury-text-shadow text-gold-400">
              <DecorativeIcon
                icon="spade"
                className="inline-block mr-3 text-purple-400"
              />
              Spread the Word & Earn
            </h2>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.4}>
            <ReferralCard />
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gray-900 relative">
        <div className="container mx-auto max-w-4xl">
          <ScrollAnimationWrapper>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center font-display">
              Frequently <span className="text-primary">Asked</span> Questions
            </h2>
          </ScrollAnimationWrapper>

          <div className="space-y-6">
            <FaqItem
              question="What is ANTILIXH?"
              answer="ANTILIXH is a premium web3 gambling platform that combines the excitement of gaming with blockchain technology. The platform offers provably fair games, exclusive rewards, and luxury experiences for its users."
              delay={100}
            />

            <FaqItem
              question="How can I participate in the presale?"
              answer="To participate in the presale, connect your Web3 wallet (MetaMask, Trust Wallet, etc.), enter the amount of ETH you wish to invest, and complete the transaction. The ANTX tokens will be distributed to your wallet once the presale concludes."
              delay={200}
            />

            <FaqItem
              question="What are the benefits of buying during presale?"
              answer="Presale investors receive tokens at a discounted price compared to the public launch. You'll also receive bonuses based on the current phase and will have early access to platform features and exclusive VIP benefits."
              delay={300}
            />

            <FaqItem
              question="When will ANTX be listed on exchanges?"
              answer="ANTX will be listed on decentralized exchanges within 2-3 weeks after the presale ends. Major centralized exchange listings will follow in the subsequent months as the platform grows."
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
    </>
  );
}

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
