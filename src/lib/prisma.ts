// utils/prisma.ts (or lib/prisma.ts, or wherever you store your Prisma instance)

import { PrismaClient } from "@prisma/client";

// Declare a global variable to hold the PrismaClient instance
// This is necessary for hot-reloading in development and for
// serverless environments to reuse the same instance.
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production, simply create a new instance
  prisma = new PrismaClient();
} else {
  // In development, store the instance on the global object
  // to avoid creating new instances on hot-reloads (which can
  // exhaust database connections or create "prepared statement" errors).
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
