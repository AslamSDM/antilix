"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  count?: number;
  scrollPercentage?: number;
  className?: string;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  count = 40,
  scrollPercentage = 0,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameId = useRef<number>(0);

  // Colors for the particles
  const colors = ["#B38B2E", "#D9B154", "#F2D680", "#FFFFFF"];

  // Initialize particles on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setDimensions({ width, height });

        // Re-initialize particles with new dimensions
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
          newParticles.push(createParticle(width, height));
        }
        setParticles(newParticles);
      }
    };

    // Create a particle
    const createParticle = (width: number, height: number): Particle => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [count, colors]);

  // Store particles data in a ref to avoid re-renders
  const particlesRef = useRef<Particle[]>([]);

  // Update particles ref when particles state changes
  useEffect(() => {
    particlesRef.current = [...particles];
  }, [particles]);

  // Animation loop
  useEffect(() => {
    if (
      !canvasRef.current ||
      dimensions.width === 0 ||
      particlesRef.current.length === 0
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Update and draw each particle without setting state
      for (let i = 0; i < particlesRef.current.length; i++) {
        const particle = particlesRef.current[i];

        // Update position
        particle.x += particle.speedX * (1 + scrollPercentage * 2);
        particle.y += particle.speedY * (1 + scrollPercentage * 2);

        // Reset if out of bounds
        if (particle.x < 0 || particle.x > dimensions.width) {
          particle.x = Math.random() * dimensions.width;
        }
        if (particle.y < 0 || particle.y > dimensions.height) {
          particle.y = Math.random() * dimensions.height;
        }

        // Draw the particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity * (1 - scrollPercentage * 0.5);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [dimensions, scrollPercentage]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default ParticleBackground;
