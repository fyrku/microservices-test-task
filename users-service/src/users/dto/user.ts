import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginatedResponseDto } from './common';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    minLength: 2,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'The name of the user',
    example: 'Jane Doe',
    minLength: 2,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiPropertyOptional({
    description: 'The email of the user',
    example: 'jane.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '60c72b2f9b1e8b001c8f8e1',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The creation date of the user',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export type PaginatedUsersResponseDto = PaginatedResponseDto<UserResponseDto>;
