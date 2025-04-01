import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { BasicStrategy as Strategy } from 'passport-http';

import { AuthService } from '../auth.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private authService: AuthService) {
    super();
    console.log('[DEBUG] BasicStrategy created. AuthService is:', this.authService);
  }

  async validate(username: string, pass: string): Promise<any> {
    // if (!this.authService) {
    //   console.error('[ERROR] authService is undefined inside validate!');
    //   throw new UnauthorizedException('Internal error');
    // }
  
    const user = await this.authService.validateUser(username, pass);
    if (!user) {
      throw new UnauthorizedException();
    }
  
    const { password, ...result } = user;
    return result;
  }
}
