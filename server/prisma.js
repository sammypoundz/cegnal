import { PrismaClient } from "@prisma/client";

// Single Prisma instance shared across the server (hot-reload safe in dev).
export const prisma = new PrismaClient();

export default prisma;
