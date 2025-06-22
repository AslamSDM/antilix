import React, { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/next-auth";
import prisma from "@/lib/prisma";
import ProfileClientContent from "./ProfileClientContent";

export const dynamic = "force-dynamic";
export const revalidate = 60; // Revalidate data every 60 seconds

interface Purchase {
  id: string;
  createdAt: Date;
  lmxTokensAllocated: any; // Using 'any' for the Decimal type from Prisma
  status: string;
  network: string;
  transactionSignature: string;
}

interface UserData {
  purchases: Purchase[];
  balance: number;
  purchaseCount: number;
  referrals: {
    count: number;
    totalBonus: number;
  };
}

async function getUserData(userId: string): Promise<UserData> {
  // Get user's purchase history
  const purchases = await prisma.purchase.findMany({
    where: {
      userId: userId,
      status: "COMPLETED",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      lmxTokensAllocated: true,
      status: true,
      network: true,
      transactionSignature: true,
    },
  });

  // Calculate total LMX balance from completed purchases
  const balance = purchases.reduce((total, purchase) => {
    // Convert Decimal to number for calculation
    const amount =
      typeof purchase.lmxTokensAllocated === "object"
        ? parseFloat(purchase.lmxTokensAllocated.toString())
        : parseFloat(purchase.lmxTokensAllocated || "0");
    return total + amount;
  }, 0);

  // Get referral data - users who have this user as their referrer
  const referredUsers = await prisma.user.findMany({
    where: {
      referrerId: userId,
    },
    select: {
      id: true,
    },
  });

  // Get purchases made by referred users to calculate actual bonus
  let totalReferralBonus = 0;

  if (referredUsers.length > 0) {
    const referredUserIds = referredUsers.map((user) => user.id);

    // Get all completed purchases by referred users
    const referralPurchases = await prisma.purchase.findMany({
      where: {
        userId: { in: referredUserIds },
        status: "COMPLETED",
      },
      select: {
        lmxTokensAllocated: true,
      },
    });

    // Calculate bonus as 5% of the referred purchases (this is an example, adjust the percentage as needed)
    const referralBonusPercentage = 0.05;

    totalReferralBonus = referralPurchases.reduce((total, purchase) => {
      const purchaseAmount =
        typeof purchase.lmxTokensAllocated === "object"
          ? parseFloat(purchase.lmxTokensAllocated.toString())
          : parseFloat(purchase.lmxTokensAllocated || "0");

      return total + purchaseAmount * referralBonusPercentage;
    }, 0);
  }

  return {
    purchases,
    balance,
    purchaseCount: purchases.length,
    referrals: {
      count: referredUsers.length,
      totalBonus: parseFloat(totalReferralBonus.toFixed(2)),
    },
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  let userData: UserData = {
    purchases: [],
    balance: 0,
    purchaseCount: 0,
    referrals: {
      count: 0,
      totalBonus: 0,
    },
  };

  // Only fetch user data if the user is authenticated
  if (session?.user?.id) {
    userData = await getUserData(session.user.id);
  }

  // Convert the purchases to a format that's serializable for the client component
  const serializableUserData = {
    purchases: userData.purchases.map((purchase) => ({
      ...purchase,
      createdAt: purchase.createdAt.toISOString(),
      lmxTokensAllocated: purchase.lmxTokensAllocated.toString(),
    })),
    balance: userData.balance,
    purchaseCount: userData.purchaseCount,
    referrals: userData.referrals,
  };

  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      {/* @ts-ignore - We'll update the component props in the next step */}
      <ProfileClientContent
        userData={serializableUserData}
        initialSession={session}
      />
    </Suspense>
  );
}
