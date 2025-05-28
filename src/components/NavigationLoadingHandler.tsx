"use client";

import React from "react";
import { useNavigationLoading } from "@/lib/useNavigationLoading";

/**
 * This component handles triggering loading animation during route changes
 */
export default function NavigationLoadingHandler() {
  // This hook will automatically trigger loading animation on route changes
  useNavigationLoading();

  return null; // This is a utility component that doesn't render anything
}
