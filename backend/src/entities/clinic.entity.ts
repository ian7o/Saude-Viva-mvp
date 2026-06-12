import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Doctor } from "./doctor.entity";
import { Appointment } from "./appointment.entity";

@Entity("clinics")
export class Clinic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @OneToMany(() => Doctor, (doctor) => doctor.clinic)
  doctors: Doctor[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
