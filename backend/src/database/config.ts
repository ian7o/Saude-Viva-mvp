import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Doctor } from "src/entities/doctor.entity";
import { Patient } from "src/entities/patient.entity";
import { Appointment } from "src/entities/appointment.entity";
import { ClinicalDocument } from "src/entities/clinical-document.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/users/entities/user.entity";

const databaseUrl = process.env.DATABASE_URL || "";

const isSqlite =
  databaseUrl.includes("sqlite") || !databaseUrl.includes("postgres");

export const typeOrmConfig: TypeOrmModuleOptions = isSqlite
  ? {
      type: "sqlite",
      database: "./saudeviva.db",
      synchronize: true,
      logging: false,
      entities: [Doctor, Patient, Appointment, ClinicalDocument, Message, User],
    }
  : {
      type: "postgres",
      url:
        databaseUrl || "postgres://postgres:postgres@localhost:5432/saudeviva",
      synchronize: true,
      logging: false,
      entities: [Doctor, Patient, Appointment, ClinicalDocument, Message, User],
      migrations: ["src/database/migrations/*.ts"],
      migrationsRun: true,
    };
