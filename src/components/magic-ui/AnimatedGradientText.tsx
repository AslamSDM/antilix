import { cn } from "@/lib/utils";
import React, { CSSProperties } from "react";

interface AnimatedGradientTextProps {
  children: React.ReactNode;
  className?: string;
  fromColor?: string;
  toColor?: string;
  duration?: number; // in seconds
}

const AnimatedGradientText: React.FC<AnimatedGradientTextProps> = ({
  children,
  className,
  fromColor = "hsl(var(--primary))", // Default to primary color
  toColor = "hsl(var(--secondary))", // Default to secondary color
  duration = 5,
}) => {
  return (
    <span
      style={
        {
          "--gradient-from": fromColor,
          "--gradient-to": toColor,
          "--gradient-duration": `${duration}s`,
          "--gradient-position": "200%", // Controls animation distance
        } as CSSProperties
      }
      className={cn(
        "animate-gradient bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
};
export default AnimatedGradientText;
