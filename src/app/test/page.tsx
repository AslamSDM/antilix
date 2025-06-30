"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

import Spline from "@splinetool/react-spline";

export default function HomePage() {
  // Section change detection

  return (
    <div className="relative w-full">
      {/* Main 3D scene container */}
      <div className="sticky top-0 left-0 w-full h-screen z-0 overflow-hidden">
        <Spline
          scene="https://prod.spline.design/ypLMYfb0s1KZPBHq/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Scrollable height container */}
      <div style={{ height: "600vh" }} aria-hidden="true"></div>
    </div>
  );
}
