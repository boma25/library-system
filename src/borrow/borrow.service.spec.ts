import { Test, TestingModule } from '@nestjs/testing';
import { BorrowService } from './borrow.service';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { BooksService } from 'src/books/books.service';

describe('BorrowService', () => {
  let service: BorrowService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    borrow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    book: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockBookService = {
    getBookById: jest.fn(),
    updateBook: jest.fn(),
  };

  const mockUserService = {
    findUserById: jest.fn(),
    findOneUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BorrowService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BooksService,
          useValue: mockBookService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<BorrowService>(BorrowService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('[0] should be defined', () => {
    expect(service).toBeDefined();
  });

  it('[1] should find a borrow by id', async () => {
    const borrowerId = '1';
    const expectedBorrow = {
      id: '1',
      title: 'test',
    };

    mockPrismaService.borrow.findUnique.mockResolvedValue(expectedBorrow);

    mockUserService.findUserById.mockResolvedValue({ id: '1' });

    const result = await service.findBorrowRecordById(borrowerId, '1');

    expect(result).toEqual(expectedBorrow);
    expect(prismaService.borrow.findUnique).toHaveBeenCalledWith({
      where: { borrowerId, id: '1' },
      include: {
        book: {
          include: {
            author: true,
          },
        },
        borrower: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });
  });

  it('[2] should fail when trying to find a borrow by id', async () => {
    const borrowerId = '1';
    mockPrismaService.borrow.findUnique.mockResolvedValue(null);

    await expect(service.findBorrowRecordById(borrowerId, '1')).rejects.toThrow(
      'invalid borrow id',
    );
    expect(prismaService.borrow.findUnique).toHaveBeenCalledWith({
      where: { borrowerId, id: '1' },
      include: {
        book: {
          include: {
            author: true,
          },
        },
        borrower: {
          select: {
            email: true,
            id: true,
          },
        },
      },
    });
  });

  it('[3] should find all borrows', async () => {
    const expectedBorrows = [
      {
        id: '1',
        title: 'test',
      },
    ];

    mockPrismaService.borrow.findMany.mockResolvedValue(expectedBorrows);

    const result = await service.findBorrowRecords('1');

    expect(result).toEqual({ data: expectedBorrows, limit: 50, lastId: '1' });
    expect(prismaService.borrow.findMany).toHaveBeenCalledWith({
      where: { borrowerId: '1' },
      select: {
        id: true,
        book: {
          select: {
            title: true,
          },
        },
      },
      take: 50,
    });
  });

  it('[4] should find all borrows with pagination', async () => {
    const expectedBorrows = [
      {
        id: '1',
        title: 'test',
      },
    ];

    mockPrismaService.borrow.findMany.mockResolvedValue(expectedBorrows);

    const result = await service.findBorrowRecords('1', 10, '1');

    expect(result).toEqual({ data: expectedBorrows, limit: 10, lastId: '1' });
    expect(prismaService.borrow.findMany).toHaveBeenCalledWith({
      where: { borrowerId: '1' },
      select: {
        id: true,
        book: {
          select: {
            title: true,
          },
        },
      },
      take: 10,
      skip: 1,
      cursor: { id: '1' },
    });
  });

  it('[5] should create a borrow record', async () => {
    const userId = '1';
    const data = {
      bookId: '1',
      borrowDate: new Date(),
      returnDate: new Date(),
    };

    mockPrismaService.borrow.create.mockResolvedValue(null);

    mockUserService.findOneUser.mockResolvedValue({ id: '1' });

    mockBookService.getBookById.mockResolvedValue({ id: '1' });

    await service.createBorrowRecord(userId, data);

    expect(prismaService.borrow.create).toHaveBeenCalledWith({
      data: {
        book: { connect: { id: '1' } },
        borrower: { connect: { id: '1' } },
        borrowDate: data.borrowDate,
        returnDate: data.returnDate,
      },
    });
  });

  it('[6] should fail when creating a borrow record', async () => {
    const userId = '1';
    const data = {
      bookId: '1',
      borrowDate: new Date(),
      returnDate: new Date(),
    };

    mockPrismaService.borrow.create.mockResolvedValue(null);

    mockUserService.findOneUser.mockResolvedValue(null);

    mockBookService.getBookById.mockResolvedValue(null);

    await expect(service.createBorrowRecord(userId, data)).rejects.toThrow(
      'invalid user id',
    );
  });

  it('[7] should fail when creating a borrow record with an invalid book  id', async () => {
    const userId = '1';
    const data = {
      bookId: '1',
      borrowDate: new Date(),
      returnDate: new Date(),
    };

    mockPrismaService.borrow.create.mockResolvedValue(null);

    mockUserService.findOneUser.mockResolvedValue({ id: '1' });

    mockBookService.getBookById.mockResolvedValue(null);

    await expect(service.createBorrowRecord(userId, data)).rejects.toThrow(
      'invalid book id',
    );
  });

  it('[8] should fail when creating a borrow record with an invalid return date', async () => {
    const userId = '1';
    const data = {
      bookId: '1',
      borrowDate: new Date('2021-02-01'),
      returnDate: new Date('2020-01-01'),
    };

    mockPrismaService.borrow.create.mockResolvedValue(null);

    mockUserService.findOneUser.mockResolvedValue({ id: '1' });

    mockBookService.getBookById.mockResolvedValue({ id: '1' });

    await expect(service.createBorrowRecord(userId, data)).rejects.toThrow(
      'return date must be greater than borrow date',
    );
  });

  it('[9] should fail when creating a borrow record with an already borrowed book', async () => {
    const userId = '1';
    const data = {
      bookId: '1',
      borrowDate: new Date(),
      returnDate: new Date(),
    };

    mockPrismaService.borrow.create.mockResolvedValue(null);

    mockUserService.findOneUser.mockResolvedValue({ id: '1' });

    mockBookService.getBookById.mockResolvedValue({ id: '1' });

    mockPrismaService.borrow.findFirst.mockResolvedValue({ id: '1' });

    await expect(service.createBorrowRecord(userId, data)).rejects.toThrow(
      'you have already borrowed this book',
    );
  });

  it('[10] should update a borrow record', async () => {
    const userId = '1';
    const data = {
      returnDate: new Date(),
    };
    const borrowId = '1';

    const borrow = {
      id: '1',
      book: {
        id: '1',
        availableCopies: 1,
      },
      returnDate: new Date(),
    };

    mockPrismaService.borrow.findFirst.mockResolvedValue(borrow);

    mockPrismaService.borrow.update.mockResolvedValue(borrow);

    await service.updateBorrowRecord(borrowId, userId, data);

    expect(prismaService.borrow.update).toHaveBeenCalledWith({
      where: { id: borrowId },
      data,
    });
  });

  it('[11] should fail when updating a borrow record with an invalid borrow id', async () => {
    const userId = '1';
    const data = {
      returnDate: new Date(),
    };
    const borrowId = '1';

    mockPrismaService.borrow.findFirst.mockResolvedValue(null);

    await expect(
      service.updateBorrowRecord(borrowId, userId, data),
    ).rejects.toThrow('invalid borrow id');
  });

  it('[12] should fail when updating a borrow record with an invalid return date', async () => {
    const userId = '1';
    const data = {
      returnDate: new Date('2020-01-01'),
    };
    const borrowId = '1';

    const borrow = {
      id: '1',
      book: {
        id: '1',
        availableCopies: 1,
      },
      borrowDate: new Date('2021-02-01'),
      returnDate: new Date(),
    };

    mockPrismaService.borrow.findFirst.mockResolvedValue(borrow);

    await expect(
      service.updateBorrowRecord(borrowId, userId, data),
    ).rejects.toThrow('return date must be greater than borrow date');
  });

  it('[13] should delete borrow record', async () => {
    const userId = '1';
    const borrowId = '1';

    const borrow = {
      id: '1',
      book: {
        id: '1',
        availableCopies: 1,
      },
    };

    mockPrismaService.borrow.findUnique.mockResolvedValue(borrow);

    mockPrismaService.borrow.delete.mockResolvedValue(borrow);

    await service.deleteBorrowRecord(borrowId, userId);

    expect(prismaService.borrow.delete).toHaveBeenCalledWith({
      where: { id: borrowId, borrowerId: userId },
    });
  });

  it('[14] should fail when deleting a borrow record with an invalid borrow id', async () => {
    const userId = '1';
    const borrowId = '1';

    mockPrismaService.borrow.findUnique.mockResolvedValue(null);

    await expect(service.deleteBorrowRecord(borrowId, userId)).rejects.toThrow(
      'invalid borrow id',
    );
  });
});
