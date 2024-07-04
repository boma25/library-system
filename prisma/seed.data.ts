import { Role, Prisma } from '@prisma/client';

export const superAdminSeedData: Prisma.UserCreateInput = {
  email: 'admin@admin.com',
  role: Role.ADMIN,
  password: '$2b$10$Umk.oeeVHPQwly53FRsAXe/hW2ugfqoypSaO6hefxKd05Jr49i6Zq',
};
