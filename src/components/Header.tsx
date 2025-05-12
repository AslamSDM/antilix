import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { QuraniumLogo } from "./QuraniumLogo";

export function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[var(--header-height)] z-50">
      <QuraniumLogo />
    </div>
  );
}
