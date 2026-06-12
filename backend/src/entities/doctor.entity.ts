import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Appointment } from "./appointment.entity";
import { ClinicalDocument } from "./clinical-document.entity";
import { Clinic } from "./clinic.entity";

@Entity("doctors")
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  clinicId: number;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctors)
  clinic: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => ClinicalDocument, (document) => document.doctor)
  documents: ClinicalDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
