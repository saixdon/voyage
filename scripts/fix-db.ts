import { PrismaClient } from '../src/generated/client/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Dropping conflicting foreign key constraint...');
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE public.favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;`);
    console.log('Successfully dropped favorites_user_id_fkey.');
  } catch (e) {
    console.error('Error dropping constraint:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
