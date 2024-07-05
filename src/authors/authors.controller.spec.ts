import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as request from 'supertest';
import { mockAdmin } from 'src/utils/constants';
import { authHelpers } from 'src/utils/helpers/auth.helpers';
import { faker } from '@faker-js/faker';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserService } from 'src/user/user.service';
import { RolesGuard } from 'src/auth/guards/roles.guards';

describe('AuthorsController', () => {
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
      controllers: [AuthorsController],
      providers: [
        AuthorsService,
        PrismaService,
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    await prisma.author.deleteMany();
    await prisma.user.deleteMany();
    jest.clearAllMocks();
  });

  it('[0] should work properly create author', async () => {
    const author = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const response = await request(app.getHttpServer())
      .post('/authors/create')
      .send(author)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name', author.name);
    expect(response.body.data).toHaveProperty('bio', author.bio);
    expect(response.body.data).toHaveProperty(
      'birthDate',
      author.birthDate.toISOString(),
    );
  });

  it('[1] should fail when trying to create author with ab already existing author', async () => {
    const author = {
      name: faker.lorem.word(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    await prisma.author.create({
      data: author,
    });

    const response = await request(app.getHttpServer())
      .post('/authors/create')
      .send(author)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(409);

    expect(response.body.message).toBe('Author already exist');
  });

  it('[2] should fail when trying to create author with invalid data', async () => {
    const author = {
      name: faker.lorem.word(),
      bio: faker.lorem.sentence(),
    };

    const response = await request(app.getHttpServer())
      .post('/authors/create')
      .send(author)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message[0]).toBe(
      'birthDate must be a valid ISO 8601 date string',
    );
  });

  it('[3] should work properly get authors', async () => {
    const authors = Array.from({ length: 10 }, () => ({
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    }));

    await prisma.author.createMany({
      data: authors,
    });

    const response = await request(app.getHttpServer())
      .get('/authors')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(response.body.data).toHaveLength(10);
  });

  it('[4] should work properly get authors with pagination', async () => {
    const authors = Array.from({ length: 10 }, () => ({
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    }));

    await prisma.author.createMany({
      data: authors,
    });

    const response = await request(app.getHttpServer())
      .get('/authors')
      .query({ limit: 5 })
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(response.body.data).toHaveLength(5);
  });

  it('[5] should work properly get author', async () => {
    const author = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const newAuthor = await prisma.author.create({
      data: author,
    });

    const response = await request(app.getHttpServer())
      .get(`/authors/${newAuthor.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(response.body.data).toHaveProperty('id', newAuthor.id);
    expect(response.body.data).toHaveProperty('name', author.name);
    expect(response.body.data).toHaveProperty('bio', author.bio);
    expect(response.body.data).toHaveProperty(
      'birthDate',
      author.birthDate.toISOString(),
    );
  });

  it('[6] should fail when trying to get author with invalid uuid id', async () => {
    const response = await request(app.getHttpServer())
      .get('/authors/invalid-id')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message).toBe('Validation failed (uuid is expected)');
  });

  it('[7] should fail when trying to get author with non existing id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/authors/${faker.string.uuid()}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message).toBe('invalid author id');
  });

  it('[8] should work properly update author', async () => {
    const author = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const newAuthor = await prisma.author.create({
      data: author,
    });

    const updatedAuthor = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const response = await request(app.getHttpServer())
      .put(`/authors/${newAuthor.id}`)
      .send(updatedAuthor)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(response.body.data).toHaveProperty('id', newAuthor.id);
    expect(response.body.data).toHaveProperty('name', updatedAuthor.name);
    expect(response.body.data).toHaveProperty('bio', updatedAuthor.bio);
    expect(response.body.data).toHaveProperty(
      'birthDate',
      updatedAuthor.birthDate.toISOString(),
    );
  });

  it('[9] should fail when trying to update author with invalid data', async () => {
    const author = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const newAuthor = await prisma.author.create({
      data: author,
    });

    const updatedAuthor = {
      name: faker.lorem.word(),
      bio: faker.lorem.sentence(),
      birthDate: 'invalid date string',
    };

    const response = await request(app.getHttpServer())
      .put(`/authors/${newAuthor.id}`)
      .send(updatedAuthor)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message[0]).toBe(
      'birthDate must be a valid ISO 8601 date string',
    );
  });

  it('[10] should fail when trying to update author with non existing id', async () => {
    const updatedAuthor = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const response = await request(app.getHttpServer())
      .put(`/authors/${faker.string.uuid()}`)
      .send(updatedAuthor)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message).toBe('invalid author id');
  });

  it('[11] should fail when trying to update author with already existing author', async () => {
    const authors = Array.from({ length: 2 }, () => ({
      id: faker.string.uuid(),
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    }));

    await prisma.author.createMany({
      data: authors,
    });

    const updatedAuthor = {
      name: authors[1].name,
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const response = await request(app.getHttpServer())
      .put(`/authors/${authors[0].id}`)
      .send(updatedAuthor)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(409);

    expect(response.body.message).toBe('Author with this name already exist');
  });

  it('[12] should work properly delete author', async () => {
    const author = {
      name: faker.person.firstName(),
      bio: faker.lorem.sentence(),
      birthDate: faker.date.past(),
    };

    const newAuthor = await prisma.author.create({
      data: author,
    });

    const response = await request(app.getHttpServer())
      .delete(`/authors/${newAuthor.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(200);

    expect(response.body.data).toHaveProperty('id', newAuthor.id);
    expect(response.body.data).toHaveProperty('name', author.name);
    expect(response.body.data).toHaveProperty('bio', author.bio);
    expect(response.body.data).toHaveProperty(
      'birthDate',
      author.birthDate.toISOString(),
    );
  });

  it('[13] should fail when trying to delete author with invalid uuid id', async () => {
    const response = await request(app.getHttpServer())
      .delete('/authors/invalid-id')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message).toBe('Validation failed (uuid is expected)');
  });

  it('[14] should fail when trying to delete author with non existing id', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/authors/${faker.string.uuid()}`)
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer token')
      .expect(400);

    expect(response.body.message).toBe('invalid author id');
  });
});
