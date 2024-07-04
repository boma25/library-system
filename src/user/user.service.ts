import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SignUpDto } from 'src/auth/Dto/signUp.Dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  async findOneUser(userUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.prismaService.user.findUnique({
      where: userUniqueInput,
    });
  }

  async createUser(data: SignUpDto) {
    const userExist = await this.findOneUser({ email: data.email });
    if (userExist)
      throw new ConflictException('a user with this email already exist');

    return this.prismaService.user.create({
      data,
    });
  }
}
