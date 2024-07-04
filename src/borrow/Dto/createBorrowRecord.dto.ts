import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreateBorrowRecord {
  @ApiProperty()
  @IsUUID()
  bookId: string;

  @ApiProperty()
  @IsDateString()
  borrowDate: Date;

  @ApiProperty()
  @IsDateString()
  returnDate: Date;
}
