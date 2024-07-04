import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateBorrowRecord {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  returnDate: Date;
}
