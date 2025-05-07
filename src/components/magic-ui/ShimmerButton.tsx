import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
  className?: string;
  children: React.ReactNode;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.1em", // Size of the shimmer line
      shimmerDuration = "1.5s",
      borderRadius = "0.5rem", // Matches shadcn's default radius
      background = "hsl(var(--primary))", // Use shadcn primary color
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-width": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--button-border-radius": borderRadius,
            "--button-background": background,
          } as React.CSSProperties
        }
        className={cn(
          "animate-shimmer group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap rounded-[--button-border-radius] bg-[linear-gradient(110deg,var(--button-background),45%,var(--shimmer-color),55%,var(--button-background))] bg-[length:200%_100%] px-6 py-3 text-sm font-medium text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:pointer-events-none disabled:opacity-50",
          "hover:bg-[length:250%_100%]", // Slightly accelerate shimmer on hover
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";
export default ShimmerButton;
