import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateAuthorDto } from './Dto/createAuthor.dto';
import { Author, Prisma } from '@prisma/client';
import { TServerResponse } from 'src/@types/app.types';
import { UpdateAuthorDto } from './Dto/updateAuthor.dto';

@Injectable()
export class AuthorsService {
  constructor(private prismaService: PrismaService) {}

  async findAuthorById(id: string): Promise<Author> {
    const author = await this.prismaService.author.findUnique({
      where: { id },
    });

    if (!author) {
      throw new BadRequestException('invalid author id');
    }
    return author;
  }

  async findAuthor(
    authorWhereUnique: Prisma.AuthorWhereUniqueInput,
  ): Promise<Author | null> {
    return await this.prismaService.author.findUnique({
      where: authorWhereUnique,
    });
  }

  async findAuthors(
    take = 50,
    lastId?: string,
  ): Promise<TServerResponse<Author[]>> {
    const query: Prisma.AuthorFindManyArgs = {
      take: take,
      select: { id: true, name: true },
    };

    if (lastId) {
      query.skip = 1;
      query.cursor = { id: lastId };
    }
    const data = await this.prismaService.author.findMany(query);
    return { data, limit: take, lastId: data[data.length - 1]?.id };
  }

  async createAuthor(data: CreateAuthorDto): Promise<Author> {
    const authorExist = await this.findAuthor({ name: data.name });
    if (authorExist) throw new ConflictException('Author already exist');
    return this.prismaService.author.create({
      data,
    });
  }

  async updateAuthor(id: string, data: UpdateAuthorDto): Promise<Author> {
    const author = await this.findAuthorById(id);
    if (!author) throw new BadRequestException('invalid author id');
    if (data.name) {
      const authorExist = await this.findAuthor({ name: data.name });
      if (authorExist && author.id !== authorExist.id)
        throw new ConflictException('Author with this name already exist');
    }
    return this.prismaService.author.update({
      where: { id },
      data,
    });
  }

  async deleteAuthor(id: string): Promise<Author> {
    const author = await this.findAuthorById(id);
    if (!author) throw new BadRequestException('invalid author id');
    try {
      return this.prismaService.author.delete({
        where: { id },
      });
    } catch {
      throw new InternalServerErrorException('error deleting author');
    }
  }
}
