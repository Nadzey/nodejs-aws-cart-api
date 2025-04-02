import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { Inject, forwardRef, BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


export interface TokenResponse {
  token_type: string;
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    console.log('[DEBUG] AuthService created. UsersService:', !!usersService);
  }

  async register(payload: RegisterDto) {
    try {
      console.log('[DEBUG] Register payload:', payload);

      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const user = await this.usersService.findOne(payload.email);
      if (user) {
        throw new BadRequestException('User already exists');
      }

      const createdUser = await this.usersService.createOne({
        ...payload,
        password: hashedPassword,
      });

      return { userId: createdUser.id };
    } catch (err) {
      console.error('[REGISTER ERROR]', err);
      throw err;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }
  
  login(user: User, type: 'jwt' | 'basic' | 'default'): TokenResponse {
    const LOGIN_MAP = {
      jwt: this.loginJWT,
      basic: this.loginBasic,
      default: this.loginJWT,
    };
    const login = LOGIN_MAP[type];
    return login ? login(user) : LOGIN_MAP.default(user);
  }

  loginJWT(user: User): TokenResponse {
    const payload = { username: user.email, sub: user.id };
    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User): TokenResponse {
    const { email, password } = user;
    const buf = Buffer.from([email, password].join(':'), 'utf8');
    return {
      token_type: 'Basic',
      access_token: buf.toString('base64'),
    };
  }
}
