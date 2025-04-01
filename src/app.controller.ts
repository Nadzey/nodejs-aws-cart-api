import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpStatus,
  Body,
  HttpCode,
} from '@nestjs/common';
import {
  LocalAuthGuard,
  AuthService,
  BasicAuthGuard,
} from './auth';
import { AppRequest } from './shared';
import { IsEmail, IsString, MinLength } from 'class-validator';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @Get(['', 'ping'])
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('auth/login')
  async login(@Request() req: AppRequest) {
    const token = this.authService.login(req.user, 'basic');
    return token;
  }

  @UseGuards(BasicAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AppRequest) {
    return {
      user: req.user,
    };
  }
}
