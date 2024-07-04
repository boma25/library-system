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

describe('BorrowController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowController],
      providers: [
        BorrowService,
        UserService,
        BooksService,
        PrismaService,
        AuthorsService,
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {});

  it('[0] should work properly', () => {});
});
