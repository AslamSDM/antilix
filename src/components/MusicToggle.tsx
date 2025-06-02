"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const MusicToggle = ({ isPlaying, onToggle }: MusicToggleProps) => {
  return (
    <button
      onClick={onToggle}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white transition-colors"
      title={isPlaying ? "Mute Background Music" : "Play Background Music"}
      aria-label={isPlaying ? "Mute Background Music" : "Play Background Music"}
    >
      {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
};

export default MusicToggle;
