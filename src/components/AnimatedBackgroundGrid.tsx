"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { InteractiveGridPattern } from "./magicui/interactive-grid-pattern";

interface AnimatedBackgroundGridProps {
  className?: string;
}

export const AnimatedBackgroundGrid: React.FC<AnimatedBackgroundGridProps> = ({
  className,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={cn("grid-pattern-container", className)}>
      {/* Base grid layer */}
      <div
        className="fixed inset-0 w-full h-full grid-background-animate"
        style={{
          transform: `translate(${mousePosition.x * 5}px, ${
            mousePosition.y * 5
          }px)`,
          transition: "transform 1s ease-out",
        }}
      >
        <InteractiveGridPattern
          className="w-full h-full opacity-20 dark:opacity-30 [mask-image:radial-gradient(800px_circle_at_center,transparent,black)]"
          width={40}
          height={40}
          squares={[40, 40]}
          squaresClassName="hover:fill-primary/20 dark:hover:fill-primary/30"
        />
      </div>

      {/* Secondary grid layer - slightly offset */}
      <div
        className="fixed inset-0 w-full h-full opacity-10"
        style={{
          transform: `translate(${-mousePosition.x * 10}px, ${
            -mousePosition.y * 10
          }px) scale(1.1)`,
          transition: "transform 1.5s ease-out",
        }}
      >
        <InteractiveGridPattern
          className="w-full h-full"
          width={60}
          height={60}
          squares={[30, 30]}
          squaresClassName="hover:fill-secondary/20"
        />
      </div>

      {/* Overlay to create depth effect */}
      <div className="grid-pattern-overlay"></div>
    </div>
  );
};
