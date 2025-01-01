import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate user credentials
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      const { password, ...result } = user.toObject(); // Exclude password from result
      return result;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  // Generate a JWT for the user
  async login(user: any): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Register a new user
  async register(userDto: any): Promise<any> {
    const existingUser = await this.userService.findByEmail(userDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email is already taken');
    }
    return this.userService.create(userDto);
  }
}
