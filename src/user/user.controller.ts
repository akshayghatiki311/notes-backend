import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all user-related routes
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Get user by ID
  @Get('profile')
  async getUserById(@Request() req: any) {
    const id = req.user.userId;
    const user = await this.userService.findById(id);
    if (!user) {
      return { message: 'User not found' };
    }
    return user;
  }
}
