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
import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/user.entity';

interface HealthCheckResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  database: string;
  service?: {
    status: string;
    uptime: number;
  };
  error?: string;
}

@Controller()
export class AppController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    console.log('[DEBUG] AppController injected AuthService:', !!authService);
  }  

  @Get(['', 'ping'])
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      // Test database connection
      await this.userRepository.count();

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        timestamp: new Date().toISOString(),
        database: 'Connected',
        service: {
          status: 'running',
          uptime: process.uptime()
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service Unhealthy',
        timestamp: new Date().toISOString(),
        database: 'Disconnected',
        error: errorMessage
      };
    }
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
    if (!req.user) throw new UnauthorizedException();
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
