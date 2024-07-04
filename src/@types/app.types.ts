import { Role, User } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export type TSerializedUser = Omit<User, 'password'>;

export type TServerResponse<T> = {
  data?: T;
  limit?: number;
  lastId?: string;
  page?: number;
  message?: string;
};

export type TApiResponse<T = object> = Promise<TServerResponse<T>>;

export type TLoginResponse = {
  user: TSerializedUser;
  authToken: string;
};

export class QueryParamDTO {
  @IsNumberString()
  @IsOptional()
  limit?: string;

  @IsUUID()
  @IsOptional()
  lastId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  genre?: string;

  @IsNumberString()
  @IsOptional()
  publishedYear?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  ascending?: string;
}

export interface IAppRequest extends Request {
  userId: string;
  email: string;
  role: Role;
}
