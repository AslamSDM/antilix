"use client";

import React from "react";
import ReferralBonuses from "@/components/ReferralBonuses";
import { Card } from "@/components/ui/card";
import PageTransition from "@/components/PageTransition";
import NavigationLoadingHandler from "@/components/NavigationLoadingHandler";

export default function ReferralPage() {
  return (
    <NavigationLoadingHandler>
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow container mx-auto p-4 md:p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-center">
              Referral Program
            </h1>

            <div className="mb-8">
              <Card className="bg-black/40 backdrop-blur-lg border-gray-800 p-6">
                <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
                <div className="space-y-4">
                  <p>
                    Share your unique referral code with friends and earn{" "}
                    <span className="font-bold text-blue-400">
                      5% bonus tokens
                    </span>{" "}
                    on their purchases!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="bg-black/30 p-6 rounded-lg">
                      <div className="text-xl font-bold mb-2">1. Share</div>
                      <p className="text-gray-300">
                        Share your unique referral code with friends interested
                        in Antilix.
                      </p>
                    </div>

                    <div className="bg-black/30 p-6 rounded-lg">
                      <div className="text-xl font-bold mb-2">2. Purchase</div>
                      <p className="text-gray-300">
                        When they make a purchase using your code, it's linked
                        to your account.
                      </p>
                    </div>

                    <div className="bg-black/30 p-6 rounded-lg">
                      <div className="text-xl font-bold mb-2">3. Earn</div>
                      <p className="text-gray-300">
                        You automatically receive 5% bonus tokens based on their
                        purchase amount.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <ReferralBonuses />
          </main>
        </div>
      </PageTransition>
    </NavigationLoadingHandler>
  );
}
