"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ShimmerButton from "@/components/magic-ui/ShimmerButton";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle,
  Code,
  Cpu,
  Lock,
  Database,
  Network,
  Users,
  ChevronRight,
  Box, // Replacing Cube with Box icon
} from "lucide-react";

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
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="bg-gradient-to-b from-background via-background to-muted min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto py-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              Blockchain Security Reinvented
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Quantum-Resistant <span className="text-primary">Quranium</span>
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-muted-foreground">
            Quranium is the first truly quantum-proof blockchain that provides
            uncrackable security for the next generation of digital assets and
            applications. Our Layer 1 DLT is designed to withstand the
            computational powers of tomorrow's quantum computers.
          </p>
        </motion.div>

        {/* Technology Visualization */}
        <motion.div
          className="w-full max-w-3xl mx-auto h-[400px] md:h-[500px] rounded-xl shadow-2xl overflow-hidden bg-card my-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 relative flex items-center justify-center">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping"></div>
              <div
                className="absolute top-3/4 left-2/3 w-1 h-1 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/4 left-2/3 w-1 h-1 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="absolute top-3/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <Box className="w-24 h-24 text-primary animate-pulse" />
              <div className="mt-4 text-xl font-medium text-center">
                Quantum-Resistant Cryptography
              </div>
              <div className="text-sm text-muted-foreground mt-2 text-center max-w-md px-4">
                Our advanced encryption algorithms are designed to resist
                attacks from both classical and quantum computers.
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Technology
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quranium employs cutting-edge cryptographic technologies to create
              a secure, efficient, and future-proof blockchain infrastructure.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TechCard
              icon={<Lock className="w-8 h-8 text-blue-500" />}
              title="Post-Quantum Cryptography"
              description="Implements lattice-based cryptographic schemes that are resistant to quantum computing attacks."
              variants={itemVariants}
            />
            <TechCard
              icon={<Database className="w-8 h-8 text-green-500" />}
              title="Distributed Ledger Technology"
              description="Immutable and transparent transaction record with enhanced privacy features and data protection."
              variants={itemVariants}
            />
            <TechCard
              icon={<Shield className="w-8 h-8 text-amber-500" />}
              title="Zero-Knowledge Proofs"
              description="Privacy-preserving validation mechanism that enables transactions without revealing sensitive information."
              variants={itemVariants}
            />
            <TechCard
              icon={<Network className="w-8 h-8 text-purple-500" />}
              title="Cross-Chain Compatibility"
              description="Secure interoperability with existing blockchain networks through quantum-safe bridge protocols."
              variants={itemVariants}
            />
            <TechCard
              icon={<Cpu className="w-8 h-8 text-cyan-500" />}
              title="Quantum-Resistant Consensus"
              description="Novel consensus mechanism designed to maintain security integrity against quantum threats."
              variants={itemVariants}
            />
            <TechCard
              icon={<Code className="w-8 h-8 text-rose-500" />}
              title="Secure Smart Contracts"
              description="Quantum-safe programmable transactions with formal verification for maximum security."
              variants={itemVariants}
            />
          </motion.div>
        </div>
      </section>

      {/* Enterprise Solutions Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise Solutions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Quranium provides tailored blockchain solutions for various
              industries requiring the highest level of security.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <EnterpriseSolution
              title="Financial Institutions"
              description="Secure transaction processing and asset management with quantum-resistant protection for financial data."
              variants={itemVariants}
            />
            <EnterpriseSolution
              title="Healthcare Providers"
              description="Unbreakable encryption for sensitive patient data with compliant record-keeping systems."
              variants={itemVariants}
            />
            <EnterpriseSolution
              title="Government & Defense"
              description="Critical infrastructure protection with future-proof security for national security applications."
              variants={itemVariants}
            />
            <EnterpriseSolution
              title="Supply Chain Management"
              description="Tamper-proof tracking and verification for global logistics and product authenticity."
              variants={itemVariants}
            />
          </motion.div>
        </div>
      </section>

      {/* Security Standards Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Security Standards
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our blockchain adheres to and exceeds the most rigorous security
              standards in the industry.
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <SecurityStandard
              title="NIST Post-Quantum Cryptography"
              description="Implementation of the National Institute of Standards and Technology recommended quantum-resistant algorithms."
              variants={itemVariants}
            />
            <SecurityStandard
              title="ISO/IEC 27001"
              description="Compliance with international standards for information security management systems."
              variants={itemVariants}
            />
            <SecurityStandard
              title="GDPR & Privacy by Design"
              description="Built-in privacy controls and data protection mechanisms that comply with global regulations."
              variants={itemVariants}
            />
            <SecurityStandard
              title="Formal Verification"
              description="Mathematical proof of cryptographic protocol security and smart contract execution."
              variants={itemVariants}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-t from-background to-muted/30">
        <motion.div
          className="container mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-6">
            Secure Your Digital Future
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Learn more about how Quranium's quantum-resistant blockchain can
            protect your organization's digital assets against both current and
            future threats.
          </p>

          <ShimmerButton
            onClick={handleBackToHome}
            className="px-8 py-4 rounded-lg font-medium text-lg"
          >
            <ChevronRight className="w-5 h-5 mr-2" />
            Explore Quranium
          </ShimmerButton>

          <p className="text-xs mt-6 text-muted-foreground">
            The only truly uncrackable blockchain infrastructure for the digital
            era.
          </p>
        </motion.div>
      </section>
    </div>
  );
};

// Technology Card Component
function TechCard({
  icon,
  title,
  description,
  variants,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variants: any;
}) {
  return (
    <motion.div
      className="bg-card p-6 rounded-xl shadow-md border border-border flex flex-col items-center text-center"
      variants={variants}
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
    >
      <div className="mb-4 p-3 bg-background rounded-full">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Enterprise Solution Component
function EnterpriseSolution({
  title,
  description,
  variants,
}: {
  title: string;
  description: string;
  variants: any;
}) {
  return (
    <motion.div
      className="bg-card p-6 rounded-xl shadow-md border border-border"
      variants={variants}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 300 },
      }}
    >
      <div className="mb-4 flex items-center">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
          <CheckCircle className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

// Security Standard Component
function SecurityStandard({
  title,
  description,
  variants,
}: {
  title: string;
  description: string;
  variants: any;
}) {
  return (
    <motion.div
      className="flex items-start p-4 bg-card rounded-lg border border-border/50 shadow-sm"
      variants={variants}
      whileHover={{ x: 5 }}
    >
      <div className="p-2 bg-primary/10 rounded-full mr-4">
        <Shield className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export default AboutPage;
