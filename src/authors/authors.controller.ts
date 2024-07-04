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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './Dto/createAuthor.dto';
import { ApiHeader, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateAuthorDto } from './Dto/updateAuthor.dto';
import { QueryParamDTO, TApiResponse } from 'src/@types/app.types';
import { Author, Role } from '@prisma/client';
import { parseQueryStringToNumber } from 'src/utils/helpers/general.helpers';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Public } from 'src/auth/decorators/public.decorators';

@Controller('authors')
@ApiTags('AUTHOR')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Public()
  @Get('')
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'lastId', required: false })
  @ApiOkResponse({
    description: 'Authors retrieved',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'author name',
          },
        ],
        message: 'Authors retrieved',
      },
    },
  })
  async getAuthors(@Query() query: QueryParamDTO): TApiResponse<Author[]> {
    const response = await this.authorsService.findAuthors(
      parseQueryStringToNumber(query?.limit),
      query.lastId,
    );
    return { ...response, message: 'Authors retrieved' };
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({
    description: 'Author retrieved',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'author name',
          birthDate: '2021-09-01',
          bio: 'author bio',
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Author retrieved',
      },
    },
  })
  async getAuthor(
    @Param('id', ParseUUIDPipe) id: string,
  ): TApiResponse<Author> {
    const data = await this.authorsService.findAuthorById(id);
    return { data, message: 'Author retrieved' };
  }

  @Roles(Role.ADMIN)
  @Post('create')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Author created',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'author name',
          birthDate: '2021-09-01',
          bio: 'author bio',
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Author created',
      },
    },
  })
  async createAuthor(@Body() body: CreateAuthorDto): TApiResponse<Author> {
    const data = await this.authorsService.createAuthor(body);
    return { data, message: 'Author created' };
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Author updated',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'author name',
          birthDate: '2021-09-01',
          bio: 'author bio',
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Author updated',
      },
    },
  })
  async updateAuthor(
    @Body() body: UpdateAuthorDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): TApiResponse<Author> {
    const data = await this.authorsService.updateAuthor(id, body);
    return { data, message: 'Author updated' };
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Author deleted',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'author name',
          birthDate: '2021-09-01',
          bio: 'author bio',
          createdAt: '2021-09-01T00:00:00.000Z',
          updatedAt: '2021-09-01T00:00:00.000Z',
        },
        message: 'Author deleted',
      },
    },
  })
  async deleteAuthor(
    @Param('id', ParseUUIDPipe) id: string,
  ): TApiResponse<Author> {
    const data = await this.authorsService.deleteAuthor(id);
    return { data, message: 'Author deleted' };
  }
}
