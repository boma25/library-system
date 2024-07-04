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
  Req,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ApiHeader, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IAppRequest, QueryParamDTO, TApiResponse } from 'src/@types/app.types';
import { Borrow } from '@prisma/client';
import { parseQueryStringToNumber } from 'src/utils/helpers/general.helpers';
import { CreateBorrowRecord } from './Dto/createBorrowRecord.dto';
import { UpdateBorrowRecord } from './Dto/updateBorrowRecord.dto';

@Controller('borrow-records')
@ApiTags('BORROW RECORDS')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Get()
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'lastId', required: false })
  @ApiOkResponse({
    description: 'Borrow Records retrieved',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            book: {
              title: 'book title',
            },
          },
        ],
        limit: 50,
        lastId: 'uuid',
        message: 'Borrow Records retrieved',
      },
    },
  })
  async getAllBorrowRecords(
    @Query() query: QueryParamDTO,
    @Req() req: IAppRequest,
  ): TApiResponse<Borrow[]> {
    const response = await this.borrowService.findBorrowRecords(
      req['userId'],
      parseQueryStringToNumber(query.limit),
      query.lastId,
    );
    return { ...response, message: 'Borrow Records retrieved' };
  }

  @Get(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Borrow Record retrieved',
    schema: {
      example: {
        data: {
          id: 'uuid',
          book: {
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
          borrower: {
            id: 'uuid',
            email: 'borrower email',
          },
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Borrow Record retrieved',
      },
    },
  })
  async getBorrowRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: IAppRequest,
  ): TApiResponse<Borrow> {
    const data = await this.borrowService.findBorrowRecordById(
      id,
      req['userId'],
    );
    return { data, message: 'Borrow Record retrieved' };
  }

  @Post('create')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Borrow Record created',
    schema: {
      example: {
        message: 'Borrow Record created',
      },
    },
  })
  async createBorrowRecord(
    @Body() data: CreateBorrowRecord,
    @Req() req: IAppRequest,
  ): TApiResponse<void> {
    await this.borrowService.createBorrowRecord(req['userId'], data);
    return { message: 'Borrow Record created' };
  }

  @Put(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Borrow Record updated',
    schema: {
      example: {
        message: 'Borrow Record updated',
      },
    },
  })
  async updateBorrowRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateBorrowRecord,
    @Req() req: IAppRequest,
  ): TApiResponse<void> {
    await this.borrowService.updateBorrowRecord(id, req['userId'], data);
    return { message: 'Borrow Record updated' };
  }

  @Delete(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Borrow Record deleted',
    schema: {
      example: {
        message: 'Borrow Record deleted',
      },
    },
  })
  async deleteBorrowRecord(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: IAppRequest,
  ): TApiResponse<void> {
    await this.borrowService.deleteBorrowRecord(id, req['userId']);
    return { message: 'Borrow Record deleted' };
  }
}
