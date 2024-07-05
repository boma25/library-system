import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthorsService } from 'src/authors/authors.service';
import { mockAdmin, mockAuthor } from 'src/utils/constants';
import { authHelpers } from 'src/utils/helpers/auth.helpers';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

describe('BooksController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        id: mockAdmin.id,
        email: mockAdmin.email,
        role: mockAdmin.role,
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        BooksService,
        PrismaService,
        AuthorsService,
        UserService,
        Reflector,
        ConfigService,
        { provide: JwtService, useValue: jwtService },
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },

        {
          provide: APP_GUARD,
          useClass: RolesGuard,
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    const password = await authHelpers.hashPassword(mockAdmin.password);
    await prisma.user.create({
      data: {
        ...mockAdmin,
        password,
      },
    });

    await prisma.author.create({
      data: mockAuthor,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();
    await prisma.book.deleteMany();
    jest.clearAllMocks();
  });

  it('[0] should work properly create book', async () => {
    const book = {
      title: faker.lorem.words(3),
      authorId: mockAuthor.id,
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    const response = await request(app.getHttpServer())
      .post('/books/create')
      .set('Authorization', 'Bearer token')
      .set('Accept', 'application/json')
      .send(book)
      .expect(201);

    expect(response.body.data.title).toEqual(book.title);
    expect(response.body.data.authorId).toEqual(mockAuthor.id);
    expect(response.body.data.genre).toEqual(book.genre);
    expect(response.body.data.publishedYear).toEqual(book.publishedYear);
    expect(response.body.data.availableCopies).toEqual(book.availableCopies);
    expect(response.body.data.createdAt).toBeDefined();
    expect(response.body.data.updatedAt).toBeDefined();
    expect(response.body.message).toEqual('Book created');
  });

  it('[1] should work properly get book by id', async () => {
    const book = {
      title: faker.lorem.words(3),
      author: {
        connect: {
          id: mockAuthor.id,
        },
      },
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    const createdBook = await prisma.book.create({
      data: book,
    });
    const response = await request(app.getHttpServer())
      .get(`/books/${createdBook.id}`)
      .expect(200);

    expect(response.body.data.title).toEqual(book.title);
    expect(response.body.data.authorId).toEqual(mockAuthor.id);
    expect(response.body.data.genre).toEqual(book.genre);
    expect(response.body.data.publishedYear).toEqual(book.publishedYear);
    expect(response.body.data.availableCopies).toEqual(book.availableCopies);
    expect(response.body.data.createdAt).toBeDefined();
    expect(response.body.data.updatedAt).toBeDefined();
    expect(response.body.message).toEqual('Book retrieved');
  });

  it('[2] should work properly update book', async () => {
    const book = {
      title: faker.lorem.words(3),
      author: {
        connect: {
          id: mockAuthor.id,
        },
      },
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    const createdBook = await prisma.book.create({
      data: book,
    });
    const response = await request(app.getHttpServer())
      .put(`/books/${createdBook.id}`)
      .set('Authorization', 'Bearer token')
      .set('Accept', 'application/json')
      .send({ title: 'new title' })
      .expect(200);

    expect(response.body.data.title).toEqual('new title');
    expect(response.body.data.authorId).toEqual(mockAuthor.id);
    expect(response.body.data.genre).toEqual(book.genre);
    expect(response.body.data.publishedYear).toEqual(book.publishedYear);
    expect(response.body.data.availableCopies).toEqual(book.availableCopies);
    expect(response.body.data.createdAt).toBeDefined();
    expect(response.body.data.updatedAt).toBeDefined();
    expect(response.body.message).toEqual('Book updated');
  });

  it('[3] should work properly delete book', async () => {
    const book = {
      title: faker.lorem.words(3),
      author: {
        connect: {
          id: mockAuthor.id,
        },
      },
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    const createdBook = await prisma.book.create({
      data: book,
    });
    await request(app.getHttpServer())
      .delete(`/books/${createdBook.id}`)
      .set('Authorization', 'Bearer token')
      .set('Accept', 'application/json')
      .expect(200);

    const deletedBook = await prisma.book.findUnique({
      where: { id: createdBook.id },
    });
    expect(deletedBook).toBeNull();
  });

  it('[4] should work properly get all books', async () => {
    const book = {
      title: faker.lorem.words(3),
      author: {
        connect: {
          id: mockAuthor.id,
        },
      },
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    await prisma.book.create({
      data: book,
    });
    const response = await request(app.getHttpServer())
      .get('/books')
      .expect(200);

    expect(response.body.data.length).toEqual(1);
  });

  it('[5] should work properly get all books with pagination', async () => {
    const book = {
      title: faker.lorem.words(3),
      author: {
        connect: {
          id: mockAuthor.id,
        },
      },
      genre: faker.lorem.words(4),
      publishedYear: faker.number.int({ min: 1000, max: 9999 }),
      availableCopies: faker.number.int({ min: 1, max: 10 }),
    };
    await prisma.book.create({
      data: book,
    });
    const response = await request(app.getHttpServer())
      .get('/books')
      .query({
        limit: 1,
      })
      .expect(200);

    expect(response.body.data.length).toEqual(1);
  });
});
