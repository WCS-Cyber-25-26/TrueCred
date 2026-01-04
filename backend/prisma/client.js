const { PrismaClient } = require('../src/generated/prisma/client');
const prisma = new PrismaClient();
module.exports = prisma;
