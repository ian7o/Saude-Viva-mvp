import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Appointment } from "src/entities/appointment.entity";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { doctorId },
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDoctorAndDateRange(
    doctorId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        doctorId,
        date: Between(startDate, endDate),
      },
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDoctorAndDate(
    doctorId: number,
    date: Date,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.appointmentRepository.find({
      where: {
        doctorId,
        date: Between(startOfDay, endOfDay),
      },
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["patient", "doctor"],
    });
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }
    return appointment;
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(data);
    return await this.appointmentRepository.save(appointment);
  }

  async update(id: number, data: Partial<Appointment>): Promise<Appointment> {
    await this.appointmentRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.appointmentRepository.delete(id);
  }
}
