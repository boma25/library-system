import { PrismaClient } from '@prisma/client';
import { superAdminSeedData } from './seed.data';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('Prisma Seed');

async function main() {
  //seed super admin
  const adminExist = await prisma.user.findUnique({
    where: { email: superAdminSeedData.email },
  });
  if (!adminExist) {
    logger.log('Seeding super admin');
    await prisma.user.create({
      data: superAdminSeedData,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
