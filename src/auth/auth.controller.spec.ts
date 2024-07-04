import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { simpleFaker } from '@faker-js/faker';

describe('AuthController', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let jwtService: Partial<JwtService>;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
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

  it('[0] should fail when trying to login with an account that does not exist', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Super123*',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body.message).toBe('Invalid credentials');
  });

  it('[1] should fail when trying to login with an invalid credentials', async () => {
    const userData = {
      id: simpleFaker.string.uuid(),
      email: 'test@example.com',
      password: '$2b$10$USXNdS8/JvRBYP.X2p3wg.HjIhBxtqX6hab2NEdaK3oLyxnu01oIy',
    };

    await prisma.user.create({ data: userData });

    const loginData = {
      email: 'test@example.com',
      password: 'Super123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(400);

    expect(response.body.message).toBe('Invalid credentials');
  });

  it('[2] should login with valid credentials', async () => {
    const userData = {
      id: simpleFaker.string.uuid(),
      email: 'test@example.com',
      password: '$2b$10$USXNdS8/JvRBYP.X2p3wg.HjIhBxtqX6hab2NEdaK3oLyxnu01oIy',
    };

    await prisma.user.create({ data: userData });

    const loginData = {
      email: 'test@example.com',
      password: 'Super123*',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(201);

    expect(response.body.data.user).toEqual(
      expect.objectContaining({
        email: 'test@example.com',
        role: 'USER',
        id: userData.id,
      }),
    );
    expect(jwtService.signAsync).toBeCalled();
    expect(response.body.data.authToken).toBeDefined();
    expect(response.body.data.authToken).toBe('mocked-jwt-token');
    expect(response.body.message).toBe('login successful');
  });

  it('[3] should fail when trying to signup with an existing email', async () => {
    const userData = {
      id: simpleFaker.string.uuid(),
      email: 'test@example.com',
      password: '$2b$10$USXNdS8/JvRBYP.X2p3wg.HjIhBxtqX6hab2NEdaK3oLyxnu01oIy',
    };

    await prisma.user.create({ data: userData });

    const signUpData = {
      email: 'test@example.com',
      password: 'Treasr123*',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpData)
      .expect(409);

    expect(response.body.message).toBe('a user with this email already exist');
  });

  it('[4] should fail when trying to sign up with a weak password', async () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'password',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpData)
      .expect(400);

    expect(response.body.message[0]).toBe('password is not strong enough');
  });

  it('[5] should sign up a new user', async () => {
    const signUpData = {
      email: 'test@example.com',
      password: 'ThisIsAStrongPassword123*',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(signUpData)
      .expect(201);

    expect(response.body.message).toBe('signup successful kindly login');
  });
});
