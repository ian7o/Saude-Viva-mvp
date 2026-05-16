import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    example: 'Patient exam results',
    description: 'Document description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Room 101', description: 'Room' })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ example: 'Lisbon', description: 'Location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 1, description: 'Patient ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  patientId?: number;

  @ApiProperty({ example: 1, description: 'Appointment ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  appointmentId?: number;
}
