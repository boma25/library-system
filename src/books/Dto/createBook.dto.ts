import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ example: 'The Great Gatsby' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Fiction' })
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty({ example: 1925 })
  @IsNumber()
  publishedYear: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  availableCopies: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  authorId: string;
}
