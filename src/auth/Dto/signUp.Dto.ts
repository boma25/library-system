import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'john@does.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsStrongPassword()
  password: string;
}
