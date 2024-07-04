import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

describe('AuthorsController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        AuthorsService,
        PrismaService,
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

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('[0] shouldwork properly', () => {});
});
