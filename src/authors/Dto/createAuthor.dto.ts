import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-05-07 23:23:34.423' })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({ example: 'This is a bio' })
  @IsString()
  @IsNotEmpty()
  bio: string;
}
