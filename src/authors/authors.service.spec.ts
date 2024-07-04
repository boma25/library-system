import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { PrismaService } from 'src/prisma.service';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    author: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('[0] should be defined', () => {
    expect(service).toBeDefined();
  });

  it('[1] should find an author by id', async () => {
    const authorId = '1';
    const expectedAuthor = {
      id: '1',
      name: 'test',
    };

    mockPrismaService.author.findUnique.mockResolvedValue(expectedAuthor);

    const result = await service.findAuthorById(authorId);

    expect(result).toEqual(expectedAuthor);
    expect(prismaService.author.findUnique).toHaveBeenCalledWith({
      where: { id: authorId },
    });
  });

  it('[2] should fail when trying to find an author by id', async () => {
    const authorId = '1';
    mockPrismaService.author.findUnique.mockResolvedValue(null);

    await expect(service.findAuthorById(authorId)).rejects.toThrow(
      'invalid author id',
    );
    expect(prismaService.author.findUnique).toHaveBeenCalledWith({
      where: { id: authorId },
    });
  });

  it('[3] should find an author by unique input', async () => {
    const authorUniqueInput = { name: 'test' };
    const expectedAuthor = {
      id: '1',
      name: 'test',
    };

    mockPrismaService.author.findUnique.mockResolvedValue(expectedAuthor);

    const result = await service.findAuthor(authorUniqueInput);

    expect(result).toEqual(expectedAuthor);
    expect(prismaService.author.findUnique).toHaveBeenCalledWith({
      where: authorUniqueInput,
    });
  });

  it('[4] should find authors', async () => {
    const expectedAuthors = [
      {
        id: '1',
        name: 'test',
      },
    ];

    mockPrismaService.author.findMany.mockResolvedValue(expectedAuthors);

    const result = await service.findAuthors();

    expect(result).toEqual({ data: expectedAuthors, lastId: '1', limit: 50 });
    expect(prismaService.author.findMany).toHaveBeenCalledWith({
      take: 50,
      select: { id: true, name: true },
    });
  });

  it('[5] should create an author', async () => {
    const data = {
      name: 'test',
      birthDate: new Date(),
      bio: 'test bio of author',
    };
    const expectedAuthor = { id: '1', ...data };

    mockPrismaService.author.findUnique.mockResolvedValue(null);
    mockPrismaService.author.create.mockResolvedValue(expectedAuthor);

    const result = await service.createAuthor(data);

    expect(result).toEqual(expectedAuthor);
    expect(prismaService.author.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('[6] should fail when trying to create an author with an already existing name', async () => {
    const data = {
      name: 'test',
      birthDate: new Date(),
      bio: 'test bio of author',
    };

    const expectedAuthor = { id: '1', ...data };

    mockPrismaService.author.findUnique.mockResolvedValue(expectedAuthor);
    mockPrismaService.author.create.mockResolvedValue(expectedAuthor);

    expect(service.createAuthor(data)).rejects.toThrow('Author already exist');
  });

  it('[7] should update an author', async () => {
    const authorId = '1';
    const data = {
      name: 'test',
      birthDate: new Date(),
      bio: 'test bio of author',
    };
    const expectedAuthor = { id: '1', ...data };

    mockPrismaService.author.findUnique.mockResolvedValue(expectedAuthor);
    mockPrismaService.author.update.mockResolvedValue(expectedAuthor);

    const result = await service.updateAuthor(authorId, data);

    expect(result).toEqual(expectedAuthor);
    expect(prismaService.author.update).toHaveBeenCalledWith({
      where: { id: authorId },
      data,
    });
  });

  it('[8] should fail when trying to update an author with an invalid author id', async () => {
    const authorId = '1';
    const data = {
      name: 'test',
      birthDate: new Date(),
      bio: 'test bio of author',
    };

    mockPrismaService.author.findUnique.mockResolvedValue(null);

    expect(service.updateAuthor(authorId, data)).rejects.toThrow(
      'invalid author id',
    );
  });
});
