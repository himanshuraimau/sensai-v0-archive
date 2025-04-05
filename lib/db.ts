// This file is now deprecated as we're using Prisma client directly
// from lib/prisma.ts instead of SQLite

// Export prisma for backward compatibility if needed
import prisma from './prisma'
export default prisma

// For backward compatibility
export function getDb() {
  console.warn('getDb() is deprecated. Please use prisma client directly.')
  return prisma
}

export function closeDatabase() {
  // This is handled automatically by Prisma
  console.warn('closeDatabase() is deprecated. Prisma handles connection management.')
}

