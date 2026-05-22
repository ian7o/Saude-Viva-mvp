import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Message } from "src/entities/message.entity";
import { Patient } from "src/entities/patient.entity";
import { Doctor } from "src/entities/doctor.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Message, Patient, Doctor])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
