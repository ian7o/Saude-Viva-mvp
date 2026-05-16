import { IsEmail, IsNotEmpty, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserReqDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 25,
    description: 'User age',
    minimum: 12,
    maximum: 100,
  })
  @IsNotEmpty()
  @Min(12)
  @Max(100)
  age: number;

  @ApiProperty({
    example: 'male',
    description: 'User sex',
    enum: ['male', 'female', 'other'],
  })
  @IsNotEmpty()
  sex: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;
}
