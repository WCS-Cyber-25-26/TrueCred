// src/test.js
const prisma = require('../prisma/client');

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
