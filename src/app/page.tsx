"use client";

import HeroSection from "@/components/HeroSection";
import { VelocityScroll } from "@/components/magicui/scroll-based-velocity";
import { motion } from "framer-motion";
import { FileCode, Globe, Layers, MessageSquare, Zap } from "lucide-react";

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
            Explore the <span className="text-primary">Possibilities</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-primary" />}
              title="3D Web Experiences"
              description="Create immersive 3D experiences for the modern web using cutting-edge technologies."
            />
            <FeatureCard
              icon={<Layers className="w-8 h-8 text-indigo-500" />}
              title="Interactive Layers"
              description="Build layered interactions that respond to user input with fluid animations."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-amber-500" />}
              title="High Performance"
              description="Optimized rendering ensures smooth experiences even on mobile devices."
            />
          </div>
        </div>
      </motion.section>

      <VelocityScroll className="bg-secondary">FluxScape</VelocityScroll>
      {/* Showcase Section */}
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
                <FileCode className="w-16 h-16 text-primary" />
              </motion.div>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Build with powerful tools
              </h3>
              <p className="text-muted-foreground mb-6">
                FluxScape combines Next.js, Framer Motion, and Spline to create
                seamless interactive experiences. Design, develop, and deploy
                with a modern tech stack that prioritizes performance and
                developer experience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>Server-side rendering with Next.js</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>Fluid animations with Framer Motion</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/20 p-1">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <span>3D experiences with Spline</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-gradient-to-t from-background to-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Learn more about how FluxScape can transform your web projects with
            interactive 3D experiences.
          </p>
          <motion.a
            href="/about"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageSquare className="w-5 h-5" />
            Learn More
          </motion.a>
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
