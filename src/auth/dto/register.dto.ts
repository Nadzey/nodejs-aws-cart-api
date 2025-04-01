// файл: src/auth/dto/register.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}
