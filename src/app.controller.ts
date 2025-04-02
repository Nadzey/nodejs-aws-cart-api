import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  HttpStatus,
  Body,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { BasicAuthGuard } from './auth/guards/bacis-auth.guard';
import { RegisterDto } from './auth/dto/register.dto';
import { TokenResponse } from './auth/auth.service';
import { AppRequest } from './shared';
import { forwardRef} from '@nestjs/common';

@Controller()
export class AppController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    console.log('[DEBUG] AppController injected AuthService:', !!authService);
  }  

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
  async login(@Request() req: AppRequest): Promise<TokenResponse> {
    return this.authService.login(req.user);
  }

  @UseGuards(BasicAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AppRequest) {
    return {
      user: req.user,
    };
  }
}
