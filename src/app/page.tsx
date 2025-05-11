"use client";

import HeroSection from "@/components/HeroSection";
import ShimmerButton from "@/components/magic-ui/ShimmerButton";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { RippleButton } from "@/components/magicui/ripple-button";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";
import { motion } from "framer-motion";
import {
  FileCode,
  Globe,
  Lock,
  Shield,
  ChevronRight,
  Database,
  Network,
  Zap,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {/* Features Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-b from-background to-muted z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            The <span className="text-primary">Quantum-Proof</span> Blockchain
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-primary" />}
              title="Quantum-Resistant Security"
              description="Built to withstand both classical and quantum computing attacks using post-quantum cryptography."
            />
            <FeatureCard
              icon={<Database className="w-8 h-8 text-indigo-500" />}
              title="Layer 1 DLT"
              description="Core decentralized ledger technology designed for maximum security and future-proofing."
            />
            <FeatureCard
              icon={<Network className="w-8 h-8 text-amber-500" />}
              title="Scalable Infrastructure"
              description="Handles growing transaction volumes without compromising on security or performance."
            />
          </div>
        </div>
      </motion.section>

      <VelocityScroll className="bg-secondary">Quranium</VelocityScroll>
      {/* Security Section */}
      <motion.section
        className="py-20 px-4 bg-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2">
              <motion.div
                className="rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 h-[300px] md:h-[400px] flex items-center justify-center shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Lock className="w-16 h-16 text-primary" />
              </motion.div>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Uncrackable Digital Security
              </h3>
              <p className="text-muted-foreground mb-6">
                Quranium stands as the only truly future-proof solution in the
                blockchain space. As quantum computing advances threaten
                traditional cryptography, our technology represents not just an
                improvement, but a fundamental rethinking of secure distributed
                ledger technology.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>Post-Quantum Cryptographic Algorithms</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>Zero-Knowledge Proofs for Privacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>Mathematically Proven Security Guarantees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="py-20 px-4 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Enterprise <span className="text-primary">Use Cases</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <UseCaseCard
              title="Financial Security"
              description="Secure transaction processing resistant to future cryptographic threats for banking and financial institutions."
            />
            <UseCaseCard
              title="Government Data"
              description="Protection for sensitive public sector information with quantum-resistant encryption."
            />
            <UseCaseCard
              title="Healthcare Records"
              description="Safeguarding patient data with unbreakable encryption that stands the test of time."
            />
            <UseCaseCard
              title="Supply Chain"
              description="Immutable record-keeping for global logistics with tamper-proof transaction history."
            />
            <UseCaseCard
              title="Digital Identity"
              description="Self-sovereign identity solutions that remain secure even against quantum computing."
            />
            <UseCaseCard
              title="IoT Security"
              description="Protecting the expanding network of connected devices from emerging threats."
            />
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-t from-background to-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Secure Your Digital Future
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Learn how Quranium's quantum-proof blockchain can protect your
            organization's digital assets against both current and future
            threats.
          </p>
          <Link href={"/about"}>
            <RainbowButton>
              <ChevronRight className="w-5 h-5" />
              Explore Quranium
            </RainbowButton>
          </Link>
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
  return (
    <motion.div
      className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border"
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
  return (
    <motion.div
      className="bg-card/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-border/50"
      whileHover={{ scale: 1.03, backgroundColor: "rgba(var(--card), 0.8)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
