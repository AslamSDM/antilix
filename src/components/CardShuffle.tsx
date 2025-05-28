"use client";

import React, { useEffect, useState } from "react";
import { Diamond, Heart, Club, Spade } from "lucide-react";

interface CardShuffleProps {
  onComplete?: () => void;
}

export const CardShuffle: React.FC<CardShuffleProps> = ({ onComplete }) => {
  const [shuffleComplete, setShuffleComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShuffleComplete(true);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const cards = [
    { id: 1, suit: "diamond", delay: 0 },
    { id: 2, suit: "heart", delay: 200 },
    { id: 3, suit: "club", delay: 400 },
    { id: 4, suit: "spade", delay: 600 },
  ];

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case "diamond":
        return <Diamond className="h-full w-full" />;
      case "heart":
        return <Heart className="h-full w-full" />;
      case "club":
        return <Club className="h-full w-full" />;
      case "spade":
        return <Spade className="h-full w-full" />;
      default:
        return <Diamond className="h-full w-full" />;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-32 h-44">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`absolute w-20 h-28 luxury-card bg-gradient-to-br from-background/90 to-background flex items-center justify-center border border-primary/30`}
            style={{
              top: shuffleComplete ? "0px" : `${(card.id - 1) * 10}px`,
              left: shuffleComplete ? "0px" : `${(card.id - 1) * 8}px`,
              zIndex: shuffleComplete ? 5 - card.id : card.id,
              opacity: 1,
              transformOrigin: "center center",
              animation: shuffleComplete
                ? `shuffleCard${card.id} 0.8s forwards ${card.delay}ms`
                : `dealCard 0.5s forwards ${card.delay}ms`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              className={`text-primary w-10 h-10 ${
                shuffleComplete ? "animate-spin-slow" : ""
              }`}
            >
              {getSuitIcon(card.suit)}
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes dealCard {
          0% {
            transform: translateY(100px) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes shuffleCard1 {
          0% {
            transform: rotate(0deg) translateX(0);
          }
          100% {
            transform: rotate(15deg) translateX(60px);
          }
        }

        @keyframes shuffleCard2 {
          0% {
            transform: rotate(0deg) translateX(0);
          }
          100% {
            transform: rotate(5deg) translateX(90px);
          }
        }

        @keyframes shuffleCard3 {
          0% {
            transform: rotate(0deg) translateX(0);
          }
          100% {
            transform: rotate(-5deg) translateX(-90px);
          }
        }

        @keyframes shuffleCard4 {
          0% {
            transform: rotate(0deg) translateX(0);
          }
          100% {
            transform: rotate(-15deg) translateX(-60px);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CardShuffle;
