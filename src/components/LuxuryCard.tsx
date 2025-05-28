"use client";

import React, { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DecorativeCorner,
  DecorativeText,
  DecorativeIcon,
} from "@/components/DecorativeElements";

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  footer?: React.ReactNode;
  icon?: "diamond" | "crown" | "spade" | "club" | "heart";
  iconPosition?: "tl" | "tr" | "bl" | "br";
  decorativeText?: string;
}

export default function LuxuryCard({
  children,
  className,
  title,
  footer,
  icon = "diamond",
  iconPosition = "tr",
  decorativeText,
}: LuxuryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--x", `${x}%`);
      card.style.setProperty("--y", `${y}%`);
    };

    card.addEventListener("mousemove", handleMouseMove);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Card
      ref={cardRef}
      className={cn("relative overflow-hidden luxury-card", className)}
    >
      <div className="cut-corner-border"></div>
      <DecorativeCorner position="tl" />
      <DecorativeCorner position="br" />

      {decorativeText && (
        <DecorativeText text={decorativeText} position="left" />
      )}

      <DecorativeIcon
        icon={icon}
        size="md"
        className={cn(
          iconPosition === "tl" && "top-4 left-4",
          iconPosition === "tr" && "top-4 right-4",
          iconPosition === "bl" && "bottom-4 left-4",
          iconPosition === "br" && "bottom-4 right-4"
        )}
      />

      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}

      <CardContent>{children}</CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
