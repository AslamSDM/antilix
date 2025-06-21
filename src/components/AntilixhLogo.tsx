"use client";
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Diamond } from "lucide-react";
import Image from "next/image";

interface LitmexLogoProps {
  className?: string;
}

export function LitmexLogo({ className }: LitmexLogoProps) {
  const { theme } = useTheme();
  const textColor = theme === "light" ? "#232028" : "#ffffff";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className || ""}`}>
      <Image
        src="/images/litmex-logo.png"
        alt="Litmex Logo"
        width={40}
        height={40}
      />
      <span className="font-display text-xl tracking-wide">LITMEX</span>
    </Link>
  );
}
