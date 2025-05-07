"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import SplineSceneWrapper from "./SplineSceneWrapper";
import ShimmerButton from "./magic-ui/ShimmerButton";
import { Application } from "@splinetool/runtime";
import { useRouter } from "next/navigation";

// Using a more appropriate Spline scene for the scroll section
const SPLINE_SCENE_URL_SCROLL =
  "https://prod.spline.design/u83moeX9XEGQMWWL/scene.splinecode";

const ScrollSection: React.FC<{ mainSplineApp?: Application | null }> = ({
  mainSplineApp,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // For parallax effects on DOM elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"], // Animate from when section starts entering viewport to when it fully leaves
  });

  // Smoothed scrollYProgress for more fluid animations
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001,
  });

  // Enhanced parallax effects
  const parallaxY1 = useTransform(
    smoothScrollProgress,
    [0, 1],
    ["-20%", "20%"]
  );
  const parallaxY2 = useTransform(
    smoothScrollProgress,
    [0, 1],
    ["20%", "-20%"]
  );
  const parallaxScale = useTransform(
    smoothScrollProgress,
    [0, 0.5, 1],
    [0.8, 1.1, 0.9]
  );
  const parallaxRotate = useTransform(smoothScrollProgress, [0, 1], [0, 10]);
  const opacityChange = useTransform(
    smoothScrollProgress,
    [0, 0.3, 0.7, 1],
    [0, 1, 1, 0]
  );
  const scaleChange = useTransform(
    smoothScrollProgress,
    [0, 0.5, 1],
    [0.8, 1, 0.9]
  );

  // Background elements that move with parallax
  const bgX1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const bgX2 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Send scroll progress to Spline scene
  useEffect(() => {
    const unsubscribe = smoothScrollProgress.onChange((latest) => {
      if (mainSplineApp) {
        mainSplineApp.setVariable("scrollProgress", latest);
      }
    });
    return () => unsubscribe();
  }, [mainSplineApp, smoothScrollProgress]);

  // Animation variants for staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full py-24 px-4 md:px-8 bg-background text-foreground"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[60%] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
          style={{ x: bgX1, y: bgY }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[70%] bg-gradient-to-tl from-secondary/20 to-transparent rounded-full blur-3xl"
          style={{ x: bgX2 }}
        />
      </motion.div>

      <div className="container mx-auto max-w-7xl text-center">
        <motion.h2
          style={{ y: parallaxY1, opacity: opacityChange }}
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          Scroll-Based Animations
        </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 gap-8 md:gap-16 items-center mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={itemVariants} className="order-2 md:order-1">
            <motion.div
              style={{ scale: parallaxScale, opacity: opacityChange }}
              className="p-8 bg-card text-card-foreground rounded-xl shadow-xl border border-border/50"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-2xl font-bold mb-3">Parallax Effects</h3>
              <p className="mb-6 text-muted-foreground">
                This content block animates with a parallax effect as you
                scroll. Elements shift at different speeds, creating depth and
                dimension.
              </p>
              <motion.div className="flex items-center justify-center mb-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center"
                    style={{
                      rotate: useTransform(parallaxRotate, (r) => r * i),
                      scale: useTransform(
                        scaleChange,
                        (s) => s * (1 + i * 0.05)
                      ),
                    }}
                  >
                    <span className="text-xl font-bold">{i}</span>
                  </motion.div>
                ))}
              </motion.div>
              <ShimmerButton
                className="w-full mt-4"
                onClick={() => router.push("/about")}
              >
                Explore More
              </ShimmerButton>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="order-1 md:order-2">
            <motion.div
              className="h-[350px] md:h-[450px] rounded-xl overflow-hidden shadow-xl"
              style={{ y: parallaxY2 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <SplineSceneWrapper
                splineSceneUrl={SPLINE_SCENE_URL_SCROLL}
                scrollProgress={smoothScrollProgress.get()}
                isMobileLayout={isMobile}
                className="border border-primary/10"
              />
            </motion.div>
            <motion.p
              className="text-sm mt-4 text-muted-foreground"
              variants={itemVariants}
            >
              The 3D object above reacts to your scroll position in real-time.
              Try scrolling up and down to see the effect.
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-32 md:mt-48 relative z-10"
          style={{ opacity: scrollYProgress }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Fluid Interactions</h3>
            <div className="h-[200px] bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg flex items-center justify-center p-8 backdrop-blur-sm">
              <motion.div
                className="text-lg"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                Continue scrolling to explore more animations...
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollSection;
