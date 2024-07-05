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

export const mockBook = {
  id: faker.string.uuid(),
  title: faker.lorem.words(3),
  author: {
    connect: {
      id: mockAuthor.id,
    },
  },
  genre: faker.lorem.words(4),
  publishedYear: faker.number.int({ min: 1000, max: 9999 }),
  availableCopies: faker.number.int({ min: 1, max: 1 }),
};
