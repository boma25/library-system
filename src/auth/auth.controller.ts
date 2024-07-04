import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorators';
import { LoginDto } from './Dto/login.Dto';
import { TApiResponse, TLoginResponse } from 'src/@types/app.types';
import { SignUpDto } from './Dto/signUp.Dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('AUTH')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    description: 'login successful',
    schema: {
      example: {
        data: {
          user: {
            id: 'uuid',
            email: 'john@does.com',
            role: 'USER',
          },
          authToken: 'token',
        },
        message: 'login successful',
      },
    },
  })
  async login(@Body() body: LoginDto): TApiResponse<TLoginResponse> {
    const data = await this.authService.login(body);
    return { data, message: 'login successful' };
  }

  @Post('signup')
  @ApiOkResponse({
    description: 'signup successful',
    schema: {
      example: {
        message: 'signup successful kindly login',
      },
    },
  })
  async signUp(@Body() body: SignUpDto): TApiResponse<void> {
    await this.authService.signUp(body);
    return { message: 'signup successful kindly login' };
  }
}
