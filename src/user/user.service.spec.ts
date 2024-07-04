import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('[0] should be defined', () => {
    expect(service).toBeDefined();
  });

  it('[1] should find a user by unique input', async () => {
    const userUniqueInput: Prisma.UserWhereUniqueInput = {
      email: 'test@example.com',
    };
    const expectedUser = {
      id: '1',
      email: 'test@example.com',
      password: 'password',
    };

    mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

    const result = await service.findOneUser(userUniqueInput);

    expect(result).toEqual(expectedUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: userUniqueInput,
    });
  });

  it('[2] should fail when trying to create a user with an already existing email', async () => {
    const data = { email: 'test@example.com', password: 'password' };
    const expectedUser = { id: '1', ...data };
    mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

    expect(service.createUser(data)).rejects.toThrow(
      'a user with this email already exist',
    );
  });

  it('[3] should create a user', async () => {
    const data = { email: 'test@example.com', password: 'password' };
    const expectedUser = { id: '1', ...data };
    mockPrismaService.user.findUnique.mockResolvedValue(undefined);
    mockPrismaService.user.create.mockResolvedValue(expectedUser);

    const result = await service.createUser(data);
    expect(result).toEqual(expectedUser);
  });
});
