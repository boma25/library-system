import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Fiction' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  genre?: string;

  @ApiProperty({ example: 1925 })
  @IsNumber()
  @IsOptional()
  publishedYear?: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsOptional()
  availableCopies?: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsOptional()
  authorId?: string;
}
