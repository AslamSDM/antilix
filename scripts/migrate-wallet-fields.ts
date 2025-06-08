import { PrismaClient } from "@prisma/client";

/**
 * This script applies the wallet verification migration
 * and ensures the database schema is updated correctly.
 */
async function main() {
  console.log("Starting wallet verification migration...");

  const prisma = new PrismaClient();

  try {
    // Run the migration
    await prisma.$executeRawUnsafe(`
      -- Add new fields for wallet verification if they don't exist
      DO $$ 
      BEGIN 
        BEGIN
          ALTER TABLE "User" ADD COLUMN "walletAddress" TEXT;
        EXCEPTION
          WHEN duplicate_column THEN RAISE NOTICE 'walletAddress column already exists';
        END;
        
        BEGIN
          ALTER TABLE "User" ADD COLUMN "walletType" TEXT;
        EXCEPTION
          WHEN duplicate_column THEN RAISE NOTICE 'walletType column already exists';
        END;
        
        BEGIN
          ALTER TABLE "User" ADD COLUMN "walletVerified" BOOLEAN DEFAULT false;
        EXCEPTION
          WHEN duplicate_column THEN RAISE NOTICE 'walletVerified column already exists';
        END;
      END $$;
      
      -- Create index if not exists
      CREATE INDEX IF NOT EXISTS "User_walletAddress_idx" ON "User"("walletAddress");
    `);

    // Verify the migration
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('walletAddress', 'walletType', 'walletVerified');
    `;

    console.log("Migration verification:", tableInfo);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
