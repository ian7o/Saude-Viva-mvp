import { ApiProperty } from '@nestjs/swagger';

export class UserResDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name: string;

  @ApiProperty({ example: 25, description: 'User age' })
  age: number;

  @ApiProperty({
    example: 'male',
    description: 'User sex',
    enum: ['male', 'female', 'other'],
  })
  sex: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'active',
    description: 'User status',
    enum: ['active', 'inactive'],
  })
  status: string;
}
