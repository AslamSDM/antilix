"use client"; // Keep client component for potential Spline interactions
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ShimmerButton from "@/components/magic-ui/ShimmerButton";
import { useRouter } from "next/navigation";
// import Spline from "@splinetool/react-spline";
import {
  Award,
  CheckCircle,
  Code,
  Cpu,
  Heart,
  LightbulbIcon,
  Rocket,
  Users,
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
    console.log("About page Spline scene loaded");
  };

  const handleGoHome = () => {
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
            <Award className="h-6 w-6 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">
              About Our Journey
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Dimension Next
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-muted-foreground">
            We are exploring the future of web interactions by blending 3D
            graphics with modern UI frameworks. Our mission is to create
            immersive experiences that push the boundaries of web design.
          </p>
        </motion.div>

        {/* 3D Scene */}
        <motion.div
          className="w-full max-w-3xl mx-auto h-[400px] md:h-[500px] rounded-xl shadow-2xl overflow-hidden bg-card my-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-primary/20 via-secondary/20 to-accent/20 relative">
            {/* <Spline scene="https://prod.spline.design/EeG6Jz6Ywyi8BZOJ/scene.splinecode" /> */}
            {!isSplineReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide our approach to creating next-generation
              web experiences.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <ValueCard
              icon={<LightbulbIcon className="w-8 h-8 text-amber-500" />}
              title="Innovation"
              description="Constantly pushing boundaries and exploring new possibilities in web design and technology."
              variants={itemVariants}
            />
            <ValueCard
              icon={<CheckCircle className="w-8 h-8 text-green-500" />}
              title="Quality"
              description="Delivering exceptional experiences through meticulous attention to detail and performance optimization."
              variants={itemVariants}
            />
            <ValueCard
              icon={<Heart className="w-8 h-8 text-rose-500" />}
              title="Passion"
              description="Bringing enthusiasm and dedication to each project, driving innovation and excellence."
              variants={itemVariants}
            />
            <ValueCard
              icon={<Users className="w-8 h-8 text-blue-500" />}
              title="Collaboration"
              description="Working together with clients and partners to create solutions that meet real needs."
              variants={itemVariants}
            />
            <ValueCard
              icon={<Rocket className="w-8 h-8 text-purple-500" />}
              title="Ambition"
              description="Setting high goals and striving to exceed expectations in everything we do."
              variants={itemVariants}
            />
            <ValueCard
              icon={<Cpu className="w-8 h-8 text-cyan-500" />}
              title="Technology"
              description="Embracing cutting-edge tools and techniques to build the experiences of tomorrow."
              variants={itemVariants}
            />
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet the talented individuals behind our innovative solutions.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TeamMember
              name="Alex Rivera"
              role="Lead 3D Designer"
              variants={itemVariants}
            />
            <TeamMember
              name="Jamie Chen"
              role="Frontend Developer"
              variants={itemVariants}
            />
            <TeamMember
              name="Taylor Morgan"
              role="Creative Director"
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
          <h2 className="text-3xl font-bold mb-6">Ready to go back?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Return to the home page to explore more of our interactive
            experiences.
          </p>

          <ShimmerButton
            onClick={handleGoHome}
            className="px-8 py-4 rounded-lg font-medium text-lg"
          >
            <Code className="w-5 h-5 mr-2" />
            Return to Home
          </ShimmerButton>

          <p className="text-xs mt-6 text-muted-foreground">
            Experience the smooth page transitions powered by Framer Motion.
          </p>
        </motion.div>
      </section>
    </div>
  );
};
interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variants: any; // You could replace 'any' with more specific Framer Motion variant type if needed
}
// Value Card Component
function ValueCard({ icon, title, description, variants }: ValueCardProps) {
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

// Team Member Component
function TeamMember({
  name,
  role,
  variants,
}: {
  name: string;
  role: string;
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
      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full flex items-center justify-center">
        <Users className="w-12 h-12 text-primary/70" />
      </div>
      <h3 className="text-xl font-semibold mb-1 text-center">{name}</h3>
      <p className="text-muted-foreground text-center">{role}</p>
    </motion.div>
  );
}

export default AboutPage;
