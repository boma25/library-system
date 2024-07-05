import { Test, TestingModule } from '@nestjs/testing';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { BooksService } from 'src/books/books.service';
import { PrismaService } from 'src/prisma.service';
import { AuthorsService } from 'src/authors/authors.service';
import { mockUser, mockBook, mockAuthor } from 'src/utils/constants';
import { authHelpers } from 'src/utils/helpers/auth.helpers';
import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { ConfigService } from '@nestjs/config';

describe('BorrowController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowController],
      providers: [
        BorrowService,
        UserService,
        BooksService,
        PrismaService,
        AuthorsService,
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
    const password = await authHelpers.hashPassword(mockUser.password);
    await prisma.user.create({
      data: {
        ...mockUser,
        password,
      },
    });

    await prisma.$transaction([
      prisma.author.create({
        data: mockAuthor,
      }),
      prisma.book.create({
        data: mockBook,
      }),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();
    await prisma.book.deleteMany();
    await prisma.borrow.deleteMany();
    jest.clearAllMocks();
  });

  it('[0] should work properly create borrow', async () => {
    const borrow = {
      bookId: mockBook.id,
      borrowDate: faker.date.recent(),
      returnDate: faker.date.future(),
    };
    const result = await request(app.getHttpServer())
      .post('/borrow-records/create')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .send(borrow)
      .expect(201);

    expect(result.body.message).toEqual('Borrow Record created');

    const book = await prisma.book.findUnique({
      where: { id: mockBook.id },
    });

    expect(book.availableCopies).toEqual(mockBook.availableCopies - 1);
  });

  it('[1] should work properly get borrow record', async () => {
    const borrow = await prisma.borrow.create({
      data: {
        bookId: mockBook.id,
        borrowDate: faker.date.recent(),
        returnDate: faker.date.future(),
        borrowerId: mockUser.id,
      },
    });

    const result = await request(app.getHttpServer())
      .get(`/borrow-records/${borrow.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(result.body.data.id).toEqual(borrow.id);
    expect(result.body.data.book.id).toEqual(mockBook.id);
    expect(result.body.data.borrower.id).toEqual(mockUser.id);
    expect(result.body.message).toEqual('Borrow Record retrieved');
  });

  it('[2] should work properly update borrow record', async () => {
    const borrow = await prisma.borrow.create({
      data: {
        bookId: mockBook.id,
        borrowDate: faker.date.recent(),
        returnDate: faker.date.future(),
        borrowerId: mockUser.id,
      },
    });

    const result = await request(app.getHttpServer())
      .put(`/borrow-records/${borrow.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .send({ returnDate: faker.date.future() })
      .expect(200);

    expect(result.body.message).toEqual('Borrow Record updated');
  });

  it('[3] should work properly delete borrow record', async () => {
    const borrow = await prisma.borrow.create({
      data: {
        bookId: mockBook.id,
        borrowDate: faker.date.recent(),
        returnDate: faker.date.future(),
        borrowerId: mockUser.id,
      },
    });

    const result = await request(app.getHttpServer())
      .delete(`/borrow-records/${borrow.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(result.body.message).toEqual('Borrow Record deleted');

    const book = await prisma.book.findUnique({
      where: { id: mockBook.id },
    });

    expect(book.availableCopies).toEqual(mockBook.availableCopies + 1);
  });

  it('[4] should work properly get all borrow records', async () => {
    const borrow = await prisma.borrow.create({
      data: {
        bookId: mockBook.id,
        borrowDate: faker.date.recent(),
        returnDate: faker.date.future(),
        borrowerId: mockUser.id,
      },
    });

    const result = await request(app.getHttpServer())
      .get('/borrow-records')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(result.body.data.length).toEqual(1);
    expect(result.body.data[0].id).toEqual(borrow.id);
    expect(result.body.data[0].book.title).toEqual(mockBook.title);
  });
});
