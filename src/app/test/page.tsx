"use client";
import Spline from "@splinetool/react-spline";
import { Application } from "@splinetool/runtime";
import { useCallback, useRef, useState } from "react";

export default function TestPage() {
  const splineRef = useRef<Application | null>(null);
  const [splineApp, setSplineApp] = useState<Application | null>(null);
  const handleSplineLoad = useCallback((splineApp: Application) => {
    setSplineApp(splineApp);
    splineRef.current = splineApp;

    // Adjust the scene based on screen size

    // For small screens, adjust camera or scale

    // Simulate final loading steps after Spline is technically ready
  }, []);
  return (
    <>
      <div className="w-full h-screen">
        <Spline
          //   scene="https://prod.spline.design/uY4B5Bf0Qkau-Ucf/scene.splinecode"
          // scene="https://prod.spline.design/TzS95U5C42rKjFN4/scene.splinecode"
          // scene="https://prod.spline.design/PF2KyDFuGz-3ZjKz/scene.splinecode" // rotating logo
          // scene="https://prod.spline.design/BBw6Kuk4CCjKtUve/scene.splinecode" // dna
          // scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
          // scene="https://prod.spline.design/vJXoSpt0B2TvAmux/scene.splinecode"
          scene="https://prod.spline.design/ypLMYfb0s1KZPBHq/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>
    </>
  );
}
