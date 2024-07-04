import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Borrow, Prisma } from '@prisma/client';
import { TServerResponse } from 'src/@types/app.types';
import { PrismaService } from 'src/prisma.service';
import { CreateBorrowRecord } from './Dto/createBorrowRecord.dto';
import { UserService } from 'src/user/user.service';
import { BooksService } from 'src/books/books.service';
import { UpdateBorrowRecord } from './Dto/updateBorrowRecord.dto';

@Injectable()
export class BorrowService {
  constructor(
    private prismaService: PrismaService,
    private userService: UserService,
    private bookService: BooksService,
  ) {}

  async findBorrowRecords(
    borrowerId: string,
    take = 50,
    lastId?: string,
  ): Promise<TServerResponse<Borrow[]>> {
    const query: Prisma.BorrowFindManyArgs = {
      take,
      where: { borrowerId },
      select: {
        id: true,
        book: {
          select: {
            title: true,
          },
        },
      },
    };

    if (lastId) {
      query.skip = 1;
      query.cursor = { id: lastId };
    }

    const data = await this.prismaService.borrow.findMany(query);
    return { data, limit: take, lastId: data[data.length - 1]?.id };
  }

  async findBorrowRecordById(id: string, borrowerId: string): Promise<Borrow> {
    const borrow = await this.prismaService.borrow.findUnique({
      where: { id, borrowerId },
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

    if (!borrow) {
      throw new BadRequestException('invalid borrow id');
    }
    return borrow;
  }

  async createBorrowRecord(
    userId: string,
    data: CreateBorrowRecord,
  ): Promise<void> {
    const user = await this.userService.findOneUser({ id: userId });
    if (!user) {
      throw new BadRequestException('invalid user id');
    }

    const book = await this.bookService.getBookById(data.bookId);
    if (!book) {
      throw new BadRequestException('invalid book id');
    }

    if (book.availableCopies === 0)
      throw new BadRequestException(
        'sorry this book is currently not available',
      );

    if (new Date(data.borrowDate) > new Date(data.returnDate))
      throw new BadRequestException(
        'return date must be greater than borrow date',
      );

    const borrowRRecordExistForUserForThisBook =
      await this.prismaService.borrow.findFirst({
        where: {
          borrowerId: userId,
          bookId: data.bookId,
        },
      });

    if (borrowRRecordExistForUserForThisBook)
      throw new ForbiddenException('you have already borrowed this book');

    try {
      await this.prismaService.$transaction([
        this.prismaService.borrow.create({
          data: {
            borrowDate: data.borrowDate,
            returnDate: data.returnDate,
            borrower: {
              connect: {
                id: userId,
              },
            },
            book: {
              connect: {
                id: data.bookId,
              },
            },
          },
        }),
        this.prismaService.book.update({
          where: {
            id: data.bookId,
          },
          data: {
            availableCopies: {
              decrement: 1,
            },
          },
        }),
      ]);
    } catch {
      throw new BadRequestException('failed to create borrow record');
    }
  }

  async updateBorrowRecord(
    id: string,
    borrowerId: string,
    data: UpdateBorrowRecord,
  ): Promise<Borrow> {
    const borrow = await this.prismaService.borrow.findFirst({
      where: { id, borrowerId },
    });
    if (!borrow) {
      throw new BadRequestException('invalid borrow id');
    }

    if (new Date(borrow.borrowDate) > new Date(data.returnDate))
      throw new BadRequestException(
        'return date must be greater than borrow date',
      );

    return this.prismaService.borrow.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteBorrowRecord(id: string, borrowerId: string): Promise<void> {
    const borrow = await this.findBorrowRecordById(id, borrowerId);
    if (!borrow) {
      throw new BadRequestException('invalid borrow id');
    }

    try {
      await this.prismaService.$transaction([
        this.prismaService.borrow.delete({
          where: {
            id,
            borrowerId,
          },
        }),
        this.prismaService.book.update({
          where: {
            id: borrow.bookId,
          },
          data: {
            availableCopies: {
              increment: 1,
            },
          },
        }),
      ]);
    } catch {
      throw new BadRequestException('failed to delete borrow record');
    }
  }
}
