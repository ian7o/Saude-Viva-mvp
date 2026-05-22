import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentDto {
  @ApiProperty({
    example: "Consultation description",
    description: "Appointment description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "Cardiology", description: "Specialty" })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiProperty({
    example: "2024-01-15T10:00:00Z",
    description: "Appointment date",
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 1, description: "Doctor ID" })
  @IsNumber()
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ example: 1, description: "Patient ID" })
  @IsNumber()
  @IsNotEmpty()
  patientId: number;

  @ApiProperty({
    example: "scheduled",
    description: "Appointment status",
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(["scheduled", "completed", "cancelled", "rescheduled"])
  status?: string;
}
