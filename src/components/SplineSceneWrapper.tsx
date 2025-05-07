"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Application } from "@splinetool/runtime";
import { useTheme } from "next-themes";
import SplineLoader from "./SplineLoader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Using error boundaries to catch Spline loading errors
class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Spline component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Load Spline with better error handling
const Spline = dynamic(
  () =>
    import("@splinetool/react-spline").catch((err) => {
      console.error("Failed to load Spline component:", err);
      // Return a placeholder component that won't break the app
      return () => (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Failed to load 3D scene</p>
        </div>
      );
    }),
  {
    ssr: false,
    loading: () => <SplineLoader />,
  }
);

interface SplineSceneWrapperProps {
  splineSceneUrl: string;
  onSplineLoad?: (app: Application) => void;
  className?: string;
  // Props to pass to Spline for interaction control
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
  isMobileLayout?: boolean;
  getStartedClicked?: boolean; // To trigger button animation
  resetGetStarted?: () => void; // Callback to reset the trigger
}

const SplineSceneWrapper: React.FC<SplineSceneWrapperProps> = ({
  splineSceneUrl,
  onSplineLoad,
  className,
  mouseX,
  mouseY,
  scrollProgress,
  isMobileLayout,
  getStartedClicked,
  resetGetStarted,
}) => {
  const splineRef = useRef<Application | null>(null);
  const [isSplineComponentLoaded, setIsSplineComponentLoaded] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<string | undefined>(
    undefined
  );
  const { theme } = useTheme();

  // Track theme changes for animations
  useEffect(() => {
    if (previousTheme && previousTheme !== theme) {
      console.log(`Theme changed from ${previousTheme} to ${theme}`);
    }
    setPreviousTheme(theme);
  }, [theme, previousTheme]);

  const handleLoad = useCallback(
    (splineApp: Application) => {
      try {
        splineRef.current = splineApp;
        setIsSplineComponentLoaded(true);
        setHasLoadError(false);
        if (onSplineLoad) {
          onSplineLoad(splineApp);
        }
        console.log("Spline scene loaded:", splineSceneUrl);

        // Set initial variables
        if (splineRef.current) {
          // Set theme variable
          splineRef.current.setVariable("isDarkMode", theme === "dark");

          // Set responsive layout variable
          splineRef.current.setVariable("isMobile", isMobileLayout ?? false);

          // Set initial scroll position if provided
          if (scrollProgress !== undefined) {
            splineRef.current.setVariable(
              "scrollProgress",
              Math.max(0, Math.min(1, scrollProgress))
            );
          }

          // Trigger an initial animation
          try {
            splineRef.current.emitEvent(
              "onSceneLoaded" as any,
              "SceneController"
            );
          } catch (e) {
            // Event might not exist in all scenes
          }
        }
      } catch (error) {
        console.error("Error in Spline load handler:", error);
        setHasLoadError(true);
      }
    },
    [onSplineLoad, splineSceneUrl, theme, isMobileLayout, scrollProgress]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLDivElement, Event>) => {
      console.error("Spline scene error:", event);
      setHasLoadError(true);
      setIsSplineComponentLoaded(false);
    },
    []
  );

  // Update Spline variables when props change
  useEffect(() => {
    if (splineRef.current && isSplineComponentLoaded && !hasLoadError) {
      try {
        // Update mouse position for interactive elements
        if (mouseX !== undefined)
          splineRef.current.setVariable("mouseX", mouseX);
        if (mouseY !== undefined)
          splineRef.current.setVariable("mouseY", mouseY);

        // Update scroll position for animations
        if (scrollProgress !== undefined)
          splineRef.current.setVariable(
            "scrollProgress",
            Math.max(0, Math.min(1, scrollProgress))
          );
      } catch (error) {
        console.error("Error updating Spline variables:", error);
      }
    }
  }, [mouseX, mouseY, scrollProgress, isSplineComponentLoaded, hasLoadError]);

  // Handle responsive layout changes
  useEffect(() => {
    if (
      splineRef.current &&
      isSplineComponentLoaded &&
      isMobileLayout !== undefined
    ) {
      try {
        splineRef.current.setVariable("isMobile", isMobileLayout);
        // You can also emit an event if your Spline scene uses events for layout changes
        splineRef.current.emitEvent(
          (isMobileLayout ? "toMobileView" : "toDesktopView") as any,
          "ResponsiveController"
        );
      } catch (e) {
        // Event might not exist in all scenes
      }
    }
  }, [isMobileLayout, isSplineComponentLoaded]);

  // Handle theme changes
  useEffect(() => {
    if (splineRef.current && isSplineComponentLoaded) {
      try {
        // Set isDarkMode variable for controlling materials/lighting in Spline
        splineRef.current.setVariable("isDarkMode", theme === "dark");

        // Emit theme change event for more complex animations
        splineRef.current.emitEvent(
          (theme === "dark" ? "activateDarkMode" : "activateLightMode") as any,
          "ThemeController"
        );

        // Log the theme change
        if (previousTheme && previousTheme !== theme) {
          console.log(`Applied ${theme} mode to Spline scene`);
        }
      } catch (e) {
        // Events might not exist in all scenes
      }
    }
  }, [theme, isSplineComponentLoaded, previousTheme]);

  // Handle button click animation
  useEffect(() => {
    if (splineRef.current && isSplineComponentLoaded && getStartedClicked) {
      try {
        console.log("Emitting ButtonPressed event to Spline");
        // Try several event names and objects in case the scene uses different naming
        const events = [
          { event: "buttonPressed", object: "ButtonTriggerObject" },
          { event: "mouseHover", object: "ButtonTriggerObject" },
          { event: "click", object: "Button" },
          { event: "buttonClick", object: "Button" },
        ];

        // Try each event until one works
        for (const { event, object } of events) {
          try {
            splineRef.current.emitEvent(event as any, object);
            console.log(`Successfully emitted ${event} to ${object}`);
            break;
          } catch (e) {
            // Continue trying other events
          }
        }

        // Reset the trigger
        if (resetGetStarted) resetGetStarted();
      } catch (error) {
        console.error("Error triggering button animation:", error);
      }
    }
  }, [getStartedClicked, isSplineComponentLoaded, resetGetStarted]);

  // Handle placeholder for development
  if (
    splineSceneUrl ===
      "https://prod.spline.design/D3O2Zq6dCsHf6w-x/scene.splinecode" ||
    splineSceneUrl.trim() === ""
  ) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-muted/50 rounded-lg",
          className
        )}
      >
        <div className="p-4 text-center max-w-md">
          <motion.div
            className="mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center"
            animate={{
              rotate: [0, 10, 0, -10, 0],
              scale: [1, 1.05, 1, 1.05, 1],
            }}
            transition={{ repeat: Infinity, duration: 5 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.29 7 12 12 20.71 7"></polyline>
              <line x1="12" y1="22" x2="12" y2="12"></line>
            </svg>
          </motion.div>
          <h3 className="text-lg font-medium mb-2">3D Scene Placeholder</h3>
          <p className="text-muted-foreground text-sm">
            Replace{" "}
            <code className="text-xs bg-muted p-1 rounded">splineSceneUrl</code>{" "}
            with your Spline scene URL to see a real 3D experience.
          </p>
        </div>
      </div>
    );
  }

  // Error fallback component
  const errorFallback = (
    <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
      <div className="p-4 text-center">
        <div className="mb-4 text-error-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <p className="text-muted-foreground mb-2">
          Failed to load 3D scene. Please try refreshing the page.
        </p>
        <button
          className="text-primary text-sm underline"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn("w-full h-full relative", className)}>
      <AnimatePresence>
        {!isSplineComponentLoaded && !hasLoadError && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SplineLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {hasLoadError ? (
        errorFallback
      ) : (
        <SplineErrorBoundary fallback={errorFallback}>
          <Spline
            scene={splineSceneUrl}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full rounded-lg transition-opacity duration-500",
              !isSplineComponentLoaded && "opacity-0"
            )}
          />
        </SplineErrorBoundary>
      )}
    </div>
  );
};

export default SplineSceneWrapper;
