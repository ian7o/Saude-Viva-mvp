import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: "John Doe", description: "User name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: "patient", description: "User role" })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: "912345678", description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "12345678", description: "Identification number" })
  @IsOptional()
  @IsString()
  identificationNumber?: string;

  @ApiPropertyOptional({ example: "1990-01-01", description: "Birth date" })
  @IsOptional()
  @IsString()
  birthDate?: string;
}
