import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { ApiHeader, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { QueryParamDTO, TApiResponse } from 'src/@types/app.types';
import { Book, Role } from '@prisma/client';
import {
  parseQueryStringToBoolean,
  parseQueryStringToNumber,
} from 'src/utils/helpers/general.helpers';
import { CreateBookDto } from './Dto/createBook.dto';
import { UpdateBookDto } from './Dto/updateBook.dto';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('books')
@ApiTags('BOOKS')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get('')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'lastId', required: false })
  @ApiQuery({ name: 'genre', required: false })
  @ApiQuery({ name: 'publishedYear', required: false })
  @ApiQuery({ name: 'ascending', required: false })
  @ApiOkResponse({
    description: 'Books retrieved',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            title: 'book title',
          },
        ],
        message: 'Books retrieved',
      },
    },
  })
  async getBooks(@Query() query: QueryParamDTO): TApiResponse<Book[]> {
    const response = await this.booksService.getAllBooks(
      parseQueryStringToNumber(query?.limit),
      query.lastId,
      query.genre,
      parseQueryStringToNumber(query.publishedYear),
      parseQueryStringToBoolean(query.ascending),
    );
    return { ...response, message: 'Books retrieved' };
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({
    description: 'Book retrieved',
    schema: {
      example: {
        data: {
          id: 'uuid',
          title: 'book title',
          genre: 'genre',
          publishedYear: 2021,
          author: {
            id: 'uuid',
            name: 'author name',
          },
          availableCopies: 10,
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Book retrieved',
      },
    },
  })
  async getBookById(
    @Param('id', ParseUUIDPipe) id: string,
  ): TApiResponse<Book> {
    const data = await this.booksService.getBookById(id);
    return { data, message: 'Book retrieved' };
  }

  @Roles(Role.ADMIN)
  @Post('create')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Book created',
    schema: {
      example: {
        data: {
          id: 'uuid',
          title: 'book title',
          genre: 'genre',
          publishedYear: 2021,
          authorId: 'uuid',
          availableCopies: 10,
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Book created',
      },
    },
  })
  async createBook(@Body() body: CreateBookDto): TApiResponse<Book> {
    const data = await this.booksService.createBook(body);
    return { data, message: 'Book created' };
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Book updated',
    schema: {
      example: {
        data: {
          id: 'uuid',
          title: 'book title',
          genre: 'genre',
          publishedYear: 2021,
          authorId: 'uuid',
          availableCopies: 10,
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Book updated',
      },
    },
  })
  async updateBook(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateBookDto,
  ): TApiResponse<Book> {
    const data = await this.booksService.updateBook(id, body);
    return { data, message: 'Book updated' };
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Book deleted',
    schema: {
      example: {
        data: {
          id: 'uuid',
          title: 'book title',
          genre: 'genre',
          publishedYear: 2021,
          authorId: 'uuid',
          availableCopies: 10,
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Book deleted',
      },
    },
  })
  async deleteBook(@Param('id', ParseUUIDPipe) id: string): TApiResponse<Book> {
    const data = await this.booksService.deleteBook(id);
    return { data, message: 'Book deleted' };
  }
}
