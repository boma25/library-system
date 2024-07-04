import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthorsService } from 'src/authors/authors.service';

describe('BooksController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
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
