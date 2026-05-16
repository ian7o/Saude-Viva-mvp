import {
  IsString,
  IsOptional,
  IsDateString,
  IsAlphanumeric,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe', description: 'Patient name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '1990-01-15', description: 'Birth date' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({ example: '12345678', description: 'Identification number' })
  @IsAlphanumeric()
  @IsOptional()
  identificationNumber?: string;

  @ApiProperty({ example: '+351912345678', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'patient@example.com', description: 'Email' })
  @IsString()
  @IsOptional()
  email?: string;
}
