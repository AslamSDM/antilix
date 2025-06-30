"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

import Spline from "@splinetool/react-spline";

export default function HomePage() {
  // Section change detection

  return (
    <div className="relative w-full">
      {/* Main 3D scene container */}
      <div style={{ height: "600vh" }} aria-hidden="true">
        Test
      </div>
    </div>
  );
}
