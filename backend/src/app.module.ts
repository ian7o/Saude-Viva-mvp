import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "src/database/database.module";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";
import { DoctorsModule } from "src/doctors/doctors.module";
import { AppointmentsModule } from "src/appointments/appointments.module";
import { PatientsModule } from "src/patients/patients.module";
import { DocumentsModule } from "src/documents/documents.module";
import { MessagesModule } from "src/messages/messages.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    DoctorsModule,
    AppointmentsModule,
    PatientsModule,
    DocumentsModule,
    MessagesModule,
  ],
})
export class AppModule {}
