import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

export const AllowedHosts = [];

export const mockAdmin = {
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  role: Role.ADMIN,
};

export const mockUser = {
  id: faker.string.uuid(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  role: Role.USER,
};

export const mockAuthor = {
  id: faker.string.uuid(),
  name: faker.person.firstName(),
  bio: faker.lorem.sentence(),
  birthDate: faker.date.past(),
};
