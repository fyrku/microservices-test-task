import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class UserParamsDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '60c72b2f9b1e8b001c8f8e1',
  })
  @IsMongoId({ message: 'Invalid User ID format' })
  id: string;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Page must be a positive number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 10,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Limit must be a positive number' })
  @Min(10, { message: 'Limit must be at least 10' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    isArray: true,
    example: [
      {
        id: '60c72b2f9b1e8b001c8f8e1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: '2025-01-01T12:00:00Z',
      },
    ],
  })
  items: T[];

  @ApiProperty({
    example: 50,
  })
  total: number;

  @ApiProperty({
    example: 1,
  })
  page: number;

  @ApiProperty({
    example: 10,
  })
  limit: number;

  @ApiProperty({
    example: 5,
  })
  totalPages: number;
}
