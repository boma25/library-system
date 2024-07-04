import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { authHelpers } from 'src/utils/helpers/auth.helpers';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findOneUser: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('[0] should be defined', () => {
    expect(service).toBeDefined();
  });

  it('[1] should throw an error when user does not exist', async () => {
    const data = {
      email: 'test@example.com',
      password: 'password',
    };

    mockUserService.findOneUser.mockResolvedValue(null);

    await expect(service.login(data)).rejects.toThrow('Invalid credentials');
  });

  it('[2] should throw an error when password is not valid', async () => {
    const data = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = {
      id: '1',
      ...data,
    };

    mockUserService.findOneUser.mockResolvedValue(user);
    jest.spyOn(authHelpers, 'verifyPassword').mockResolvedValue(false);

    await expect(service.login(data)).rejects.toThrow('Invalid credentials');
  });

  it('[3] should work properly return a serialized user and an authToken', async () => {
    const data = {
      email: 'test@example.com',
      password: 'password',
    };
    const user = {
      id: '1',
      role: 'USER',
      ...data,
    };

    mockUserService.findOneUser.mockResolvedValue(user);
    jest.spyOn(authHelpers, 'verifyPassword').mockResolvedValue(true);

    mockJwtService.signAsync.mockResolvedValue('token');

    const result = await service.login(data);

    expect(result).toEqual({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      authToken: 'token',
    });
  });

  it('[4] should create a user', async () => {
    const data = {
      email: 'test@example.com',
      password: 'password',
    };
    const result = await service.signUp(data);

    expect(mockUserService.createUser).toHaveBeenCalledWith(data);
    expect(result).toBeUndefined();
  });
});
