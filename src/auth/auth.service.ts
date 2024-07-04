import { BadRequestException, Injectable } from '@nestjs/common';
import { TLoginResponse } from 'src/@types/app.types';
import { UserService } from 'src/user/user.service';
import { authHelpers } from 'src/utils/helpers/auth.helpers';
import { LoginDto } from './Dto/login.Dto';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './Dto/signUp.Dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginDto): Promise<TLoginResponse> {
    const user = await this.userService.findOneUser({ email: data.email });
    if (
      !user ||
      !(await authHelpers.verifyPassword(data.password, user.password))
    ) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      role: user.role,
      id: user.id,
      email: user.email,
    };
    return {
      user: authHelpers.serializeUser(user),
      authToken: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(data: SignUpDto) {
    data.password = await authHelpers.hashPassword(data.password);
    await this.userService.createUser(data);
  }
}
