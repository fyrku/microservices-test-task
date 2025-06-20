import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  PaginatedUsersResponseDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/user';
import {
  PaginatedResponseDto,
  PaginationQueryDto,
  ParamsDto,
} from './dto/common';
import { ErrorResponseDto } from './dto/error';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. The user could not be created due to validation errors.',
    type: ErrorResponseDto,
  })
  createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  findOne(@Param() params: ParamsDto): Promise<UserResponseDto | null> {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. The user could not be updated due to validation errors.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  updateUser(
    @Param() params: ParamsDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    return this.usersService.updateUser(params.id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully if true, false otherwise',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  removeUser(@Param() params: ParamsDto): Promise<void> {
    return this.usersService.removeUser(params.id);
  }
}
