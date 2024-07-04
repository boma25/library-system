import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { BooksModule } from 'src/books/books.module';

@Module({
  imports: [UserModule, BooksModule],
  controllers: [BorrowController],
  providers: [BorrowService, PrismaService],
})
export class BorrowModule {}
