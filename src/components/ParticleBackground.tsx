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

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || particles.length === 0 || dimensions.width === 0)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw and update each particle
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          // Update position
          const newX =
            particle.x + particle.speedX * (1 + scrollPercentage * 2);
          const newY =
            particle.y + particle.speedY * (1 + scrollPercentage * 2);

          // Reset if out of bounds
          const newParticle = {
            ...particle,
            x:
              newX < 0 || newX > dimensions.width
                ? Math.random() * dimensions.width
                : newX,
            y:
              newY < 0 || newY > dimensions.height
                ? Math.random() * dimensions.height
                : newY,
          };

          // Draw the particle
          ctx.beginPath();
          ctx.arc(
            newParticle.x,
            newParticle.y,
            newParticle.size,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = newParticle.color;
          ctx.globalAlpha = newParticle.opacity * (1 - scrollPercentage * 0.5);
          ctx.fill();

          return newParticle;
        })
      );

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [particles, dimensions, scrollPercentage]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default ParticleBackground;
