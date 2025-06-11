import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Referral Program | Antilix",
  description: "Earn bonus tokens by referring friends to Antilix",
};

export default function ReferralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
