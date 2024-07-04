import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateBookDto } from './Dto/createBook.dto';
import { UpdateBookDto } from './Dto/updateBook.dto';
import { Book, Prisma } from '@prisma/client';
import { TServerResponse } from 'src/@types/app.types';
import { AuthorsService } from 'src/authors/authors.service';

@Injectable()
export class BooksService {
  constructor(
    private prismaService: PrismaService,
    private authorsService: AuthorsService,
  ) {}

  async getBookById(id: string) {
    const book = await this.prismaService.book.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      throw new BadRequestException('invalid book id');
    }

    return book;
  }

  async getBook(
    bookWhereUnique: Prisma.BookWhereUniqueInput,
  ): Promise<Book | null> {
    return this.prismaService.book.findUnique({
      where: bookWhereUnique,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getAllBooks(
    take = 50,
    lastId?: string,
    genre?: string,
    publishedYear?: number,
    ascending?: boolean,
  ): Promise<TServerResponse<Book[]>> {
    const query: Prisma.BookFindManyArgs = {
      take: take,
      select: { id: true, title: true },
      where: {},
      orderBy: { publishedYear: 'desc' },
    };

    if (lastId) {
      query.skip = 1;
      query.cursor = { id: lastId };
    }

    if (genre) {
      query.where.AND = [{ genre: genre }];
    }

    if (publishedYear) {
      query.where.AND = [{ publishedYear: publishedYear }];
    }

    if (ascending) {
      query.orderBy = { publishedYear: 'asc' };
    }
    const data = await this.prismaService.book.findMany(query);
    return { data, limit: take, lastId: data[data.length - 1]?.id };
  }

  async createBook(data: CreateBookDto) {
    const bookExist = await this.prismaService.book.findFirst({
      where: {
        AND: [{ title: data.title }, { authorId: data.authorId }],
      },
    });
    if (bookExist) throw new BadRequestException('Book already exist');

    const author = await this.authorsService.findAuthorById(data.authorId);
    if (!author) throw new BadRequestException('invalid author id');
    return this.prismaService.book.create({
      data,
    });
  }

  async updateBook(id: string, data: UpdateBookDto) {
    const book = await this.getBookById(id);
    if (!book) throw new BadRequestException('invalid book id');
    if (data.title) {
      const bookExist = await this.prismaService.book.findFirst({
        where: {
          AND: [{ title: data.title }, { authorId: book.authorId }],
        },
      });
      if (bookExist && book.id !== bookExist.id)
        throw new BadRequestException('Book with this title already exist');
    }

    if (data.authorId) {
      const author = await this.authorsService.findAuthorById(data.authorId);
      if (!author) throw new BadRequestException('invalid author id');
    }

    return this.prismaService.book.update({
      where: { id },
      data,
    });
  }

  async deleteBook(id: string): Promise<Book> {
    const book = await this.getBookById(id);
    if (!book) throw new BadRequestException('invalid book id');
    try {
      return this.prismaService.book.delete({
        where: { id },
      });
    } catch {
      throw new InternalServerErrorException('error deleting book');
    }
  }
}
