import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { Appointment } from './appointment.entity';

@Entity('clinical_documents')
export class ClinicalDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ nullable: true })
  mimetype: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  room: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadDate: Date;

  @Column({ nullable: true })
  path: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.documents, { nullable: true })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ nullable: true })
  doctorId: number;

  @ManyToOne(() => Patient, (patient) => patient.documents, { nullable: true })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ nullable: true })
  patientId: number;

  @ManyToOne(() => Appointment, (appointment) => appointment.documents, {
    nullable: true,
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ nullable: true })
  appointmentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
