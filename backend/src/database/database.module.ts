import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeOrmConfig } from "./config";
import { Doctor } from "src/entities/doctor.entity";
import { Patient } from "src/entities/patient.entity";
import { Appointment } from "src/entities/appointment.entity";
import { ClinicalDocument } from "src/entities/clinical-document.entity";
import { Message } from "src/entities/message.entity";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([Doctor, Patient, Appointment, ClinicalDocument, Message]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
