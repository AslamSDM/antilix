"use client";

import HeroSection from "@/components/HeroSection";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";
import { HyperText } from "@/components/magicui/hyper-text";
import LuxuryCard from "@/components/LuxuryCard";
import {
  DecorativeCorner,
  DecorativeText,
  DecorativeIcon,
  Sparkle,
} from "@/components/DecorativeElements";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import BackgroundDecorations from "@/components/BackgroundDecorations";
import { motion } from "framer-motion";
import {
  Diamond,
  Crown,
  Trophy,
  Target,
  ChevronRight,
  Heart,
  Club,
  Spade,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Adding subtle background decorations throughout the page */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <BackgroundDecorations count={15} opacity={0.05} />
      </div>

      <HeroSection />
      {/* Features Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-background via-background/80 to-muted/90 z-50 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Decorative floating elements */}
        <div className="absolute top-20 right-20 opacity-30">
          <DecorativeIcon
            icon="diamond"
            className="floating-element animation-delay-300"
          />
        </div>
        <div className="absolute bottom-20 left-40 opacity-20">
          <DecorativeIcon
            icon="heart"
            className="floating-element animation-delay-700"
          />
        </div>
        <div className="absolute top-1/2 right-1/4 opacity-20">
          <DecorativeIcon
            icon="club"
            className="floating-element animation-delay-1000"
          />
        </div>

        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <div className="text-center mb-12">
              <HyperText
                className="text-3xl md:text-4xl font-bold font-display"
                duration={1000}
                startOnView={true}
              >
                The Premium Web3 Gaming Experience
              </HyperText>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimationWrapper delay={100}>
              <FeatureCard
                icon={<Diamond className="w-8 h-8 text-primary" />}
                title="Provably Fair Games"
                description="All games are verified on-chain with transparent algorithms ensuring true randomness and fairness for all players."
              />
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={300}>
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-indigo-500" />}
                title="Secure Blockchain Technology"
                description="Built on state-of-the-art blockchain technology ensuring your assets remain secure and transactions are private."
              />
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper delay={500}>
              <FeatureCard
                icon={<Crown className="w-8 h-8 text-amber-500" />}
                title="VIP Rewards Program"
                description="Exclusive benefits, bonuses, and early access to new games for our token holders and VIP members."
              />
            </ScrollAnimationWrapper>
          </div>
        </div>
      </motion.section>

      <VelocityScroll className="bg-secondary">ANTILIX</VelocityScroll>
      {/* Security Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-muted/80 via-muted to-background/90 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Decorative texts on sides */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
          <DecorativeText text="PREMIUM GAMING" position="left" />
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
          <DecorativeText text="EXCLUSIVE EXPERIENCE" position="right" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-10 left-[20%] opacity-30">
          <DecorativeIcon
            icon="spade"
            className="floating-element animation-delay-200"
          />
        </div>
        <div className="absolute bottom-20 right-[25%] opacity-20">
          <DecorativeIcon
            icon="crown"
            className="floating-element animation-delay-1500"
          />
        </div>

        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2">
              <ScrollAnimationWrapper>
                <motion.div
                  className="luxury-card bg-gradient-to-tr from-primary/20 to-secondary/20 h-[300px] md:h-[400px] flex items-center justify-center shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Diamond className="w-16 h-16 text-primary floating-element" />
                  <DecorativeCorner position="tl" />
                  <DecorativeCorner position="br" />
                  <Sparkle className="top-1/4 right-1/4" />
                  <Sparkle className="bottom-1/4 left-1/4 animation-delay-1000" />
                </motion.div>
              </ScrollAnimationWrapper>
            </div>
            <div className="w-full md:w-1/2">
              <ScrollAnimationWrapper delay={200}>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 font-display">
                  Luxury Gaming Experience
                </h3>
                <p className="text-muted-foreground mb-6">
                  ANTILIX delivers a premium web3 gaming platform that combines
                  cutting-edge blockchain technology with elegant game design.
                  Our platform offers unparalleled transparency, fairness, and
                  excitement for sophisticated players who demand the best.
                </p>
              </ScrollAnimationWrapper>
              <ScrollAnimationWrapper delay={400}>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/20 p-1">
                      <Diamond className="w-4 h-4 text-primary" />
                    </div>
                    <span>Instant Deposits and Fast Withdrawals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/20 p-1">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <span>Generous Rewards and Staking Benefits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/20 p-1">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <span>Custom VIP Programs for High Rollers</span>
                  </li>
                </ul>
              </ScrollAnimationWrapper>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Premium Games & Features Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-background/70 via-background to-background/90 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Add floating decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* Decorative floating icons */}
          <div className="absolute top-20 left-[10%] opacity-10">
            <Diamond className="w-8 h-8 text-primary floating-element animation-delay-200" />
          </div>
          <div className="absolute top-1/3 right-[15%] opacity-10">
            <Spade className="w-6 h-6 text-primary floating-element animation-delay-700" />
          </div>
          <div className="absolute bottom-1/4 left-[20%] opacity-10">
            <Club className="w-7 h-7 text-primary floating-element animation-delay-1200" />
          </div>
          <div className="absolute bottom-20 right-[25%] opacity-10">
            <Heart className="w-5 h-5 text-primary floating-element animation-delay-500" />
          </div>
          <div className="absolute top-1/2 left-[5%] opacity-10">
            <Crown className="w-9 h-9 text-primary floating-element animation-delay-1500" />
          </div>
        </div>

        <div className="container mx-auto">
          <ScrollAnimationWrapper>
            <div className="mb-12 text-center">
              <HyperText
                className="text-3xl md:text-4xl font-bold font-display"
                duration={1000}
                startOnView={true}
              >
                Premium Games & Features
              </HyperText>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <UseCaseCard
              title="Blackjack & Poker"
              description="Classic card games reimagined with provably fair algorithms and elegant digital interfaces for an authentic casino experience."
            />
            <UseCaseCard
              title="Roulette & Dice"
              description="Traditional table games with verified randomness and stunning visual effects that recreate the excitement of a luxury casino floor."
            />
            <UseCaseCard
              title="Slots & Jackpots"
              description="Themed slot machines with progressive jackpots, bonus rounds, and innovative gameplay mechanics for entertainment beyond compare."
            />
            <UseCaseCard
              title="Sports Betting"
              description="Wager on global sporting events with competitive odds and in-play betting options all secured and settled through blockchain technology."
            />
            <UseCaseCard
              title="NFT Collectibles"
              description="Collect exclusive gaming assets with real utility on our platform, from enhanced VIP status to unique visual customizations."
            />
            <UseCaseCard
              title="Token Staking"
              description="Earn rewards by staking our native token within our ecosystem, unlocking special bonuses and platform benefits."
            />
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-t from-background via-muted/50 to-muted/80 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-primary/30 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-primary/30 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-xl"></div>

        {/* Sparkle effects */}
        <Sparkle className="top-1/4 left-[15%]" />
        <Sparkle className="top-1/4 right-[15%] animation-delay-1000" />
        <Sparkle className="bottom-1/4 left-[25%] animation-delay-700" />
        <Sparkle className="bottom-1/4 right-[25%] animation-delay-1500" />

        <div className="container mx-auto text-center">
          <ScrollAnimationWrapper>
            <div className="mb-6 text-center">
              <HyperText
                className="text-3xl md:text-4xl font-bold font-display"
                duration={1000}
                startOnView={true}
              >
                Join the ANTILIX Presale
              </HyperText>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper delay={200}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Secure your position in the future of premium web3 gaming. Early
              investors gain exclusive benefits and priority access to our
              platform's most luxurious features.
            </p>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper delay={400}>
            <Link href={"/presale"}>
              <div className="relative inline-block">
                <RainbowButton>
                  <ChevronRight className="w-5 h-5" />
                  Join Presale Now
                </RainbowButton>
                {/* Subtle sparkle animation around the button */}
                <div className="absolute -inset-4 rounded-full bg-primary/5 animate-pulse"></div>
              </div>
            </Link>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper delay={600}>
            <p className="text-xs text-muted-foreground/70 mt-6">
              <Diamond className="inline-block w-3 h-3 mr-1 text-primary" />
              Limited allocation available • Presale ends June 15, 2025
            </p>
          </ScrollAnimationWrapper>
        </div>
      </motion.section>
    </>
  );
}

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  // Choose a random gambling icon for decoration
  const gamblingIcons = ["diamond", "crown", "spade", "club", "heart"] as const;
  const randomIcon =
    gamblingIcons[Math.floor(Math.random() * gamblingIcons.length)];

  return (
    <motion.div
      className="relative"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <LuxuryCard
        title={title}
        icon={randomIcon as any}
        iconPosition="tr"
        decorativeText="ANTILIX"
        className="h-full"
      >
        <div className="mb-6 mt-2">{icon}</div>
        <p className="text-muted-foreground leading-relaxed px-2">
          {description}
        </p>
      </LuxuryCard>

      {/* Add a subtle sparkle effect */}
      <Sparkle className="top-[20%] right-[15%]" />
      <Sparkle className="bottom-[30%] left-[20%]" />
    </motion.div>
  );
}

// Use Case card component
function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  // Alternate between different gambling icons
  const getRandomIcon = () => {
    const icons = ["diamond", "crown", "spade", "club", "heart"] as const;
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <ScrollAnimationWrapper>
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative"
      >
        <LuxuryCard
          title={title}
          icon={getRandomIcon() as any}
          iconPosition="bl"
          className="h-full"
        >
          <p className="text-muted-foreground leading-relaxed py-2 px-1">
            {description}
          </p>
        </LuxuryCard>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <Sparkle className="top-[40%] right-[10%] animation-delay-700" />
          <Sparkle className="bottom-[20%] left-[15%] animation-delay-1500" />
        </div>
      </motion.div>
    </ScrollAnimationWrapper>
  );
}
