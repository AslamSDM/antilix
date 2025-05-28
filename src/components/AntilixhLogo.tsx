"use client";
import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Diamond } from "lucide-react";

interface AntilixLogoProps {
  className?: string;
}

export function AntilixLogo({ className }: AntilixLogoProps) {
  const { theme } = useTheme();
  const textColor = theme === "light" ? "#232028" : "#ffffff";

  return (
    <Link href="/" className={`flex items-center gap-2 ${className || ""}`}>
      <Diamond size={24} className="text-primary" />
      <span className="font-display text-xl tracking-wide">
        <span className="text-primary">ANTI</span>
        <span style={{ color: textColor }}>LIXH</span>
      </span>
    </Link>
  );
}
