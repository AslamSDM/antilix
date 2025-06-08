"use client";

import { useEffect } from "react";

interface KeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}

/**
 * Hook for handling keyboard navigation
 */
export default function useKeyboardNavigation({
  onNext,
  onPrevious,
  onHome,
  onEnd,
  enabled = true,
}: KeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input or contentEditable element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
        case "ArrowDown":
        case "ArrowRight":
          if (onNext) {
            e.preventDefault();
            onNext();
          }
          break;

        case "ArrowUp":
        case "ArrowLeft":
          if (onPrevious) {
            e.preventDefault();
            onPrevious();
          }
          break;

        case "Home":
          if (onHome) {
            e.preventDefault();
            onHome();
          }
          break;

        case "End":
          if (onEnd) {
            e.preventDefault();
            onEnd();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onNext, onPrevious, onHome, onEnd]);
}
