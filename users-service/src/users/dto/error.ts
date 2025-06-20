import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'User with ID 507f1f77bcf86cd799439011 not found',
  })
  message!: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error!: string;
}
