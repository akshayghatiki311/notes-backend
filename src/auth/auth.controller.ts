import { Controller, Post, Body, Request, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Register a new user
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // Login an existing user
  @UseGuards(LocalAuthGuard) // Use local authentication strategy
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  // Logout the current user
  @Post('logout')
  async logout(@Res() res: Response) {
    // Clear JWT cookie if stored in cookies
    res.clearCookie('jwt'); // Adjust the cookie name if different

    return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }
}
