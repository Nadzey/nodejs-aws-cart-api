import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

import { AuthService } from '../auth.service';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    super();
    console.log('[DEBUG] BasicStrategy created. AuthService is:', !!this.authService);
  }

  async validate(username: string, pass: string): Promise<any> {
    const user = await this.authService.validateUser(username, pass);
    if (!user) {
      throw new UnauthorizedException();
    }

    const { password, ...result } = user;
    return result;
  }
}
