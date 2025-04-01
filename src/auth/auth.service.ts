import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';

type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    console.log('[DEBUG] AuthService created. UsersService:', !!usersService);
  }

  async register(payload: RegisterDto) {
    const user = await this.usersService.findOne(payload.email);
  
    if (user) {
      throw new BadRequestException('User with such email already exists');
    }
  
    const createdUser = await this.usersService.createOne(payload);
    return { userId: createdUser.id };
  }  

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);
  
    if (user) return user;
  
    return await this.usersService.createOne({ email, password });
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

  loginJWT(user: User) {
    const payload = { username: user.email, sub: user.id };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User) {
    function encodeUserToken(user: User) {
      const { email, password } = user;
      const buf = Buffer.from([email, password].join(':'), 'utf8');
      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
