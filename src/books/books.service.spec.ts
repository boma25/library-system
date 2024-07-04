import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from 'src/prisma.service';
import { AuthorsService } from 'src/authors/authors.service';

describe('BooksService', () => {
  let service: BooksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    book: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuthorService = {
    findAuthorById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuthorsService,
          useValue: mockAuthorService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('[0] should be defined', () => {
    expect(service).toBeDefined();
  });

  it('[1] should find a book by id', async () => {
    const bookId = '1';
    const expectedBook = {
      id: '1',
      title: 'test',
    };

    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);

    const result = await service.getBookById(bookId);

    expect(result).toEqual(expectedBook);
    expect(prismaService.book.findUnique).toHaveBeenCalledWith({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it('[2] should fail when trying to find a book by id', async () => {
    const bookId = '1';
    mockPrismaService.book.findUnique.mockResolvedValue(null);

    await expect(service.getBookById(bookId)).rejects.toThrow(
      'invalid book id',
    );
    expect(prismaService.book.findUnique).toHaveBeenCalledWith({
      where: { id: bookId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it('[3] should find a book by unique input', async () => {
    const bookUniqueInput = { id: '1' };
    const expectedBook = {
      id: '1',
      title: 'test',
    };

    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);

    const result = await service.getBook(bookUniqueInput);

    expect(result).toEqual(expectedBook);
    expect(prismaService.book.findUnique).toHaveBeenCalledWith({
      where: bookUniqueInput,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it('[4] should find books', async () => {
    const expectedBooks = [
      {
        id: '1',
        title: 'test',
      },
    ];

    mockPrismaService.book.findMany.mockResolvedValue(expectedBooks);

    const result = await service.getAllBooks();

    expect(result).toEqual({ data: expectedBooks, limit: 50, lastId: '1' });
    expect(prismaService.book.findMany).toHaveBeenCalledWith({
      where: {},
      take: 50,
      select: { id: true, title: true },
      orderBy: { publishedYear: 'desc' },
    });
  });

  it('[5] should create a book', async () => {
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };
    const expectedBook = { id: '1', ...data };

    mockPrismaService.book.findFirst.mockResolvedValue(null);
    mockPrismaService.book.create.mockResolvedValue(expectedBook);
    mockAuthorService.findAuthorById.mockResolvedValue({ id: '1' });

    const result = await service.createBook(data);

    expect(result).toEqual(expectedBook);
    expect(prismaService.book.create).toHaveBeenCalledWith({
      data,
    });
  });

  it('[6] should fail when trying to create a book with an already existing title', async () => {
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };

    mockPrismaService.book.findFirst.mockResolvedValue(data);

    await expect(service.createBook(data)).rejects.toThrow(
      'Book already exist',
    );

    expect(prismaService.book.create).not.toHaveBeenCalled();
  });

  it('[7] should fail when trying to create a book with an invalid author id', async () => {
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };

    mockPrismaService.book.findFirst.mockResolvedValue(null);
    mockAuthorService.findAuthorById.mockResolvedValue(null);

    await expect(service.createBook(data)).rejects.toThrow('invalid author id');

    expect(prismaService.book.create).not.toHaveBeenCalled();
  });

  it('[8] should update a book', async () => {
    const bookId = '1';
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };
    const expectedBook = { id: '1', ...data };

    mockPrismaService.book.findFirst.mockResolvedValue(null);
    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);
    mockPrismaService.book.update.mockResolvedValue(expectedBook);
    mockAuthorService.findAuthorById.mockResolvedValue({ id: '1' });

    const result = await service.updateBook(bookId, data);

    expect(result).toEqual(expectedBook);
    expect(prismaService.book.update).toHaveBeenCalledWith({
      where: { id: bookId },
      data,
    });
  });

  it('[9] should fail when trying to update a book with an invalid book id', async () => {
    const bookId = '1';
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };

    mockPrismaService.book.findUnique.mockResolvedValue(null);

    await expect(service.updateBook(bookId, data)).rejects.toThrow(
      'invalid book id',
    );

    expect(prismaService.book.update).not.toHaveBeenCalled();
  });

  it('[10] should fail when trying to update a book with an already existing title', async () => {
    const bookId = '1';
    const data = {
      title: 'test',
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };
    const expectedBook = { id: '1', ...data };

    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);
    mockPrismaService.book.findFirst.mockResolvedValue({
      ...expectedBook,
      id: '2',
    });

    await expect(service.updateBook(bookId, data)).rejects.toThrow(
      'Book with this title already exist',
    );

    expect(prismaService.book.update).not.toHaveBeenCalled();
  });

  it('[11] should fail when trying to update a book with an invalid author id', async () => {
    const bookId = '1';
    const data = {
      publishedYear: 2021,
      genre: 'test',
      authorId: '1',
      availableCopies: 10,
    };
    const expectedBook = { id: '1', ...data };

    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);
    mockAuthorService.findAuthorById.mockResolvedValue(null);

    await expect(service.updateBook(bookId, data)).rejects.toThrow(
      'invalid author id',
    );

    expect(prismaService.book.update).not.toHaveBeenCalled();
  });

  it('[12] should delete a book', async () => {
    const bookId = '1';
    const expectedBook = { id: '1', title: 'test' };

    mockPrismaService.book.findUnique.mockResolvedValue(expectedBook);
    mockPrismaService.book.delete.mockResolvedValue(expectedBook);

    const result = await service.deleteBook(bookId);

    expect(result).toEqual(expectedBook);
    expect(prismaService.book.delete).toHaveBeenCalledWith({
      where: { id: bookId },
    });
  });

  it('[13] should fail when trying to delete a book with an invalid book id', async () => {
    const bookId = '1';

    mockPrismaService.book.findUnique.mockResolvedValue(null);

    await expect(service.deleteBook(bookId)).rejects.toThrow('invalid book id');

    expect(prismaService.book.delete).not.toHaveBeenCalled();
  });
});
