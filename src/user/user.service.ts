import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Find a user by ID
  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  // Create a new user
  async create(userDto: any): Promise<User> {
    const newUser = new this.userModel(userDto);
    return newUser.save();
  }
}
