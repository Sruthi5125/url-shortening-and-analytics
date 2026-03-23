// Exports a single shared Prisma client instance.
//
// Why a singleton?
// Prisma opens a connection pool. If you create a new PrismaClient()
// in every file, you'll open too many DB connections and hit limits.
// By exporting one shared instance, the whole app reuses one pool.

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
