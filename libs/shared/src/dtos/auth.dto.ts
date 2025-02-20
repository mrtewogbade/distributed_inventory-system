import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class ValidateTokenDto {
  @IsString()
  token: string;
}

export class AuthResponseDto {
  accessToken: string;
}

export class UserDto {
  id: any;
  email: string;
  name?: string;
}

export interface RpcErrorDto {
  statusCode: number;
  message: string;
  error: string;
}
