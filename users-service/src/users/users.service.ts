import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import {
  CreateUserDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
} from './dto/user';
import { User, UserDocument } from './schemas/user';
import { PaginationQueryDto } from './dto/common';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const createdUser = new this.userModel(createUserDto);

    return createdUser.save();
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedUsersResponseDto> {
    const { page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    if (updateUserDto.email) {
      const existingUser = await this.userModel
        .findOne({
          email: updateUserDto.email,
          _id: { $ne: id },
        })
        .exec();

      if (existingUser) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async removeUser(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return;
  }
}
