import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAuthorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @ApiProperty({ example: '2024-05-07 23:23:34.423' })
  @IsDateString()
  @IsOptional()
  birthDate: Date;

  @ApiProperty({ example: 'This is a bio' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  bio: string;
}
