import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { MessageService } from 'src/message/message.service';
import {
  CreateUserDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/user';
import { User, UserDocument } from './schemas/user';
import { PaginationQueryDto } from './dto/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly messageService: MessageService,
  ) {}

  private transformUser(user: UserDocument): UserResponseDto {
    return {
      id: user._id as unknown as string,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    const userResponse = this.transformUser(savedUser);

    this.messageService.sendUserCreatedMessage(userResponse);

    return userResponse;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedUsersResponseDto> {
    const { page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).lean().exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      items: users.map((user) => this.transformUser(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findById(id).exec();

    return user ? this.transformUser(user) : null;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
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

    return this.transformUser(updatedUser);
  }

  async removeUser(id: string): Promise<void> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const userResponse = this.transformUser(deletedUser);

    this.messageService.sendUserDeletedMessage(userResponse);

    return;
  }
}
