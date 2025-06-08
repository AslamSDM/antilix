// This file will be used to set up your database and seed it with initial data
// Run with: `npx tsx scripts/setup-database.ts`

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database setup...");

  try {
    // Apply migrations
    console.log("📊 Running database migrations...");
    execSync("npx prisma migrate dev --name init", { stdio: "inherit" });

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminReferralCode = generateReferralCode(8);

    const admin = await prisma.user.create({
      data: {
        email: "admin@antilix.com",
        username: "admin",
        referralCode: adminReferralCode,
        verified: true,
      },
    });

    console.log(
      `✅ Admin user created with referral code: ${adminReferralCode}`
    );

    // Create test users with different wallet types
    console.log("👥 Creating test users...");
    await createTestUser("evmuser", "EVM", admin.id, admin.referralCode);
    await createTestUser("solanauser", "SOLANA", admin.id, admin.referralCode);

    console.log("✅ Database setup complete!");
  } catch (error) {
    console.error("❌ Error during database setup:", error);
    process.exit(1);
  }
}

async function createTestUser(
  username: string,
  walletType: "EVM" | "SOLANA",
  referrerId: string,
  referralCode: string
) {
  const email = `${username}@example.com`;
  const userReferralCode = generateReferralCode(8);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      referrerId,
      referralCode: userReferralCode,
      verified: true,
    },
  });

  // Mock address based on wallet type
  const address =
    walletType === "EVM"
      ? `0x${randomUUID().replace(/-/g, "")}`
      : generateSolanaAddress();

  await prisma.wallet.create({
    data: {
      address,
      type: walletType,
      userId: user.id,
      verified: true,
    },
  });

  console.log(
    `✅ Created test user '${username}' with ${walletType} wallet and referral code: ${userReferralCode}`
  );
}

// Helper function to generate a referral code
function generateReferralCode(length = 8) {
  return (
    "LMX" +
    randomUUID()
      .replace(/-/g, "")
      .substring(0, length - 4)
      .toUpperCase()
  );
}

// Helper function to generate a fake Solana address
function generateSolanaAddress() {
  return randomUUID().replace(/-/g, "").substring(0, 32);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
